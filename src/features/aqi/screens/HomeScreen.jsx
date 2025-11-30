import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, SafeAreaView, StatusBar, Alert, Linking 
} from 'react-native';
import * as Location from 'expo-location';

// --- STORES & HOOKS ---
import { useAqiStore } from '../../../store/aqiStore'; 
import { useNotifications } from '../../../hooks/useNotifications'; 
import { useUserStore } from '@/store/userStore'; // ✅ Import User Store

// --- COMPONENTS ---
import { fetchAqiDataByCoords } from '../api/aqiApi'; 
import AqiSummaryCard from '../components/AqiSummaryCard';
import UrgentAlerts from '../components/UrgentAlerts';
import AppShortcuts from '../components/AppShortcuts';
import DailyActions from '../components/DailyActions';
import { AqiLineChart } from '../components/AqiCharts';
import AqiSettingsModal from '../components/AqiSettingsModal';
import CustomHeader from '../../../components/CustomHeader'; 

const HomeScreen = ({ navigation }) => {
  // 1. State & Store
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Đang định vị...");
  
  // State cho Modal
  const [modalVisible, setModalVisible] = useState(false);

  // Lấy ngưỡng từ Store và hàm bắn thông báo
  const threshold = useAqiStore((state) => state.threshold);
  const { sendAlert } = useNotifications();
  
  // ✅ Lấy profile từ Firebase Store để check quyền riêng tư
  const userProfile = useUserStore((state) => state.userProfile);

  // 2. Logic kiểm tra cảnh báo
  const checkAndAlert = (data) => {
    if (!data) return;
    const pm25 = data.components.pm2_5;
    
    // So sánh: Nếu PM2.5 thực tế > Ngưỡng cài đặt
    if (pm25 > threshold) {
      sendAlert(
        "⚠️ Cảnh báo chất lượng không khí!",
        `Chỉ số PM2.5 hiện tại là ${pm25.toFixed(1)}, vượt quá ngưỡng an toàn (${threshold}).`
      );
    }
  };

  // 3. Logic Call API
  const loadData = async () => {
    setLoading(true);
    try {
      // ⚠️ FR-7.3: KIỂM TRA QUYỀN RIÊNG TƯ TỪ FIREBASE TRƯỚC
      // Nếu user chưa bật "Chia sẻ vị trí" trong cài đặt -> Dùng tọa độ mặc định
      if (!userProfile?.isLocationShared) {
        console.log("🔒 Vị trí bị tắt bởi người dùng.");
        setLocationName("TP.HCM (Vị trí ẩn)");
        
        // Tọa độ mặc định (TP.HCM)
        const defaultCoords = { latitude: 10.762, longitude: 106.660 };
        const data = await fetchAqiDataByCoords(defaultCoords.latitude, defaultCoords.longitude);
        
        setAqiData(data);
        setLoading(false);
        setRefreshing(false);
        return; // 🛑 DỪNG TẠI ĐÂY, KHÔNG GỌI LOCATION API
      }

      // --- CHỈ CHẠY KHI USER ĐÃ ĐỒNG Ý CHIA SẺ ---
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền vị trí để ứng dụng hiển thị AQI tại nơi bạn đứng.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở Cài đặt", onPress: () => Linking.openSettings() }
          ]
        );
        setLocationName("Cần quyền vị trí");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let address = await Location.reverseGeocodeAsync(location.coords);
      
      if(address.length > 0) {
        // Ưu tiên hiển thị Quận/Huyện
        setLocationName(`${address[0].subAdminArea || ''}, ${address[0].region || ''}`);
      }

      const data = await fetchAqiDataByCoords(location.coords.latitude, location.coords.longitude);
      setAqiData(data);

      // Kiểm tra cảnh báo ngay khi có dữ liệu
      checkAndAlert(data); 

    } catch (error) {
      console.error("Lỗi trang chủ:", error);
      setLocationName("Không thể lấy dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload khi component mount HOẶC khi user thay đổi setting chia sẻ vị trí
  useEffect(() => {
    loadData();
  }, [userProfile?.isLocationShared]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* --- 1. HEADER ĐỒNG BỘ --- */}
      {/* Bấm nút chuông sẽ mở Modal cài đặt */}
      <CustomHeader 
        useLogo={true}
        showNotificationButton={true}
        onNotificationPress={() => setModalVisible(true)}
      />

      {/* --- 2. MODAL CÀI ĐẶT --- */}
      <AqiSettingsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Thẻ AQI Chính */}
        <View style={styles.section}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => {
              navigation.navigate('AqiDetail', { aqiData: aqiData, locationName: locationName });
            }}
          >
            <AqiSummaryCard aqiData={aqiData} locationName={locationName} loading={loading} />
          </TouchableOpacity>
        </View>

        {/* Thông báo khẩn cấp */}
        <View style={styles.section}>
           <UrgentAlerts />
        </View>

        {/* Biểu đồ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biểu đồ xu hướng AQI</Text>
          <AqiLineChart /> 
        </View>

        {/* Grid Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ứng dụng</Text>
          <AppShortcuts navigation={navigation} />
        </View>

        {/* Hành động xanh */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Gợi ý hành động xanh mỗi ngày</Text>
          <DailyActions />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25, // Khoảng cách thoáng hơn giữa các mục
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700', // Đậm hơn chút cho giống thiết kế
    marginBottom: 15,
    color: '#333',
  }
});

export default HomeScreen;