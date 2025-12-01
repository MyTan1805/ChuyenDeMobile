import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, StatusBar, ActivityIndicator 
} from 'react-native';
import * as Location from 'expo-location';

// --- STORES & HOOKS ---
import { useAqiStore } from '../../../store/aqiStore'; 
import { useNotifications } from '../../../hooks/useNotifications'; 
import { useUserStore } from '@/store/userStore'; 

// --- COMPONENTS ---
import { fetchAqiDataByCoords, fetchAqiHistory } from '../api/aqiApi'; 
import AqiSummaryCard from '../components/AqiSummaryCard';
import UrgentAlerts from '../components/UrgentAlerts';
import AppShortcuts from '../components/AppShortcuts';
import DailyActions from '../components/DailyActions';
import { AqiLineChart } from '../components/AqiCharts';
import AqiSettingsModal from '../components/AqiSettingsModal';
import CustomHeader from '../../../components/CustomHeader'; 

const HomeScreen = ({ navigation }) => {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Đang định vị...");
  const [modalVisible, setModalVisible] = useState(false);
  
  // ✅ THÊM STATE CHO BIỂU ĐỒ
  const [chartData, setChartData] = useState(null);

  const threshold = useAqiStore((state) => state.threshold);
  
  // ✅ LẤY USER PROFILE ĐỂ CHECK LOCATION SETTING
  const { addNotificationToHistory, userProfile } = useUserStore();

  const { sendAlert } = useNotifications();

  // 1. Hàm lấy lịch sử cho biểu đồ
  const loadChartHistory = async (lat, lon) => {
      try {
          const end = Math.floor(Date.now() / 1000);
          const start = end - (24 * 3600); 
          const history = await fetchAqiHistory(lat, lon, start, end);
          
          if (history && history.list) {
              const labels = [];
              const dataPoints = [];
              // Lấy mẫu mỗi 4 tiếng 1 điểm
              const step = 4; 
              for (let i = 0; i < history.list.length; i += step) {
                  const item = history.list[i];
                  const date = new Date(item.dt * 1000);
                  labels.push(`${date.getHours()}h`);
                  dataPoints.push(item.components.pm2_5);
              }
              // Lấy 6 điểm cuối cùng để vẽ cho đẹp
              setChartData({
                  labels: labels.slice(-6), 
                  datasets: [{ data: dataPoints.slice(-6) }]
              });
          }
      } catch (e) {
          console.log("Chart Error:", e);
      }
  };

  // 2. Check & Alert logic
  const checkAndAlert = async (data) => {
    if (!data) return;
    const pm25 = data.components.pm2_5;
    
    if (pm25 > threshold) {
      const title = "⚠️ Cảnh báo chất lượng không khí!";
      const body = `Chỉ số PM2.5 là ${pm25.toFixed(1)}, vượt quá ngưỡng an toàn (${threshold}).`;
      const dataPayload = { screen: 'AqiDetail' };

      await sendAlert(title, body, dataPayload);

      if (addNotificationToHistory) {
        await addNotificationToHistory({
            type: 'weather', 
            title: title,
            body: body,
            data: dataPayload
        });
      }
    }
  };

  // 3. Main Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName("Cần quyền vị trí");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let address = await Location.reverseGeocodeAsync(location.coords);
      
      if(address.length > 0) {
        setLocationName(`${address[0].subAdminArea || ''}, ${address[0].region || ''}`);
      }

      const data = await fetchAqiDataByCoords(location.coords.latitude, location.coords.longitude);
      setAqiData(data);

      // Gọi load chart luôn khi có toạ độ
      loadChartHistory(location.coords.latitude, location.coords.longitude);

      checkAndAlert(data); 

    } catch (error) {
      console.error("Lỗi trang chủ:", error);
      setLocationName("Không thể lấy dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Chạy khi mở app hoặc khi setting vị trí thay đổi
  useEffect(() => {
    loadData();
  }, [userProfile?.isLocationShared]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <CustomHeader 
        useLogo={true}
        showNotificationButton={true}
        onNotificationPress={() => navigation.navigate('Notifications')} 
      />
      
      {/* Modal cài đặt ngưỡng (Ẩn) */}
      <AqiSettingsModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        
        <View style={styles.section}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AqiDetail', { aqiData: aqiData, locationName: locationName })}
          >
            <AqiSummaryCard aqiData={aqiData} locationName={locationName} loading={loading} />
          </TouchableOpacity>
          
          {/* Nút chỉnh ngưỡng nhanh */}
          <TouchableOpacity style={{alignSelf:'flex-end', padding:5}} onPress={() => setModalVisible(true)}>
              <Text style={{color:'#666', fontSize:12}}>⚙️ Ngưỡng: {threshold}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionNoPad}>
           <UrgentAlerts />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khám phá</Text>
          <AppShortcuts />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xu hướng PM2.5 (24h qua)</Text>
          {chartData ? (
              <AqiLineChart data={chartData} /> 
          ) : (
              <View style={{height: 200, justifyContent:'center', alignItems:'center'}}>
                  <ActivityIndicator size="small" color="#2F847C"/>
                  <Text style={{color:'#999', marginTop:10}}>Đang tải biểu đồ...</Text>
              </View>
          )}
        </View>

        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Gợi ý sống xanh</Text>
          <DailyActions />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },  
  scrollContent: { paddingTop: 10, paddingBottom: 30 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionNoPad: { paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: {
    fontSize: 18, fontFamily: 'Nunito-Bold', marginBottom: 15, color: '#333',
  }
});

export default HomeScreen;