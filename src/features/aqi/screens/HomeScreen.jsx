// src/features/aqi/screens/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, SafeAreaView, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// --- IMPORTS CÁC COMPONENTS CỦA BẠN ---
import { fetchAqiDataByCoords } from '../api/aqiApi'; 
import AqiSummaryCard from '../components/AqiSummaryCard';
import UrgentAlerts from '../components/UrgentAlerts';
import AppShortcuts from '../components/AppShortcuts';
import DailyActions from '../components/DailyActions';

const HomeScreen = ({ navigation }) => {
  // 1. State quản lý dữ liệu
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Đang định vị...");

  // 2. Logic Call API (Giữ nguyên logic cũ)
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
      
      // Lấy tên thành phố (Optional)
      let address = await Location.reverseGeocodeAsync(location.coords);
      if(address.length > 0) {
        setLocationName(address[0].city || address[0].region || "Vị trí của bạn");
      }

      // Gọi API lấy AQI
      const data = await fetchAqiDataByCoords(location.coords.latitude, location.coords.longitude);
      setAqiData(data);

    } catch (error) {
      console.error("Lỗi trang chủ:", error);
      setLocationName("Không thể lấy dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- HEADER (Logo & Menu) --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { /* Mở Menu */ }}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.logoText}>EcoMate</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* 1. Thẻ AQI (Truyền dữ liệu API vào đây) */}
        <View style={styles.section}>
          <AqiSummaryCard aqiData={aqiData} locationName={locationName} loading={loading} />
        </View>

        {/* 2. Thông báo khẩn cấp */}
        <View style={styles.section}>
           <UrgentAlerts />
        </View>

        {/* 3. Biểu đồ xu hướng (Placeholder - Giả lập ảnh như wireframe) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biểu đồ xu hướng AQI</Text>
          <Image 
            source={{ uri: 'https://via.placeholder.com/350x150.png?text=Chart+Placeholder' }} 
            style={{ width: '100%', height: 150, borderRadius: 12, opacity: 0.5 }}
            resizeMode="cover"
          />
        </View>

        {/* 4. Ứng dụng (Grid menu) */}
        <View style={styles.section}>
          <AppShortcuts navigation={navigation} />
        </View>

        {/* 5. Hành động xanh mỗi ngày */}
        <View style={styles.section}>
          <DailyActions />
        </View>

        {/* Bài đăng cộng đồng (Bạn nói là của module khác nên ta chưa bỏ vào đây hoặc để trống) */}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#2E7D32', // Màu xanh lá đậm
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  }
});

export default HomeScreen;