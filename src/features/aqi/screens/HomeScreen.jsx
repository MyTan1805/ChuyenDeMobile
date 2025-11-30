import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, StatusBar, Alert, Linking 
} from 'react-native';
import * as Location from 'expo-location';

import { useAqiStore } from '../../../store/aqiStore'; 
import { useNotifications } from '../../../hooks/useNotifications'; 
import { useUserStore } from '@/store/userStore'; 
import { fetchAqiDataByCoords, fetchAqiHistory } from '../api/aqiApi'; // Import fetchHistory
import AqiSummaryCard from '../components/AqiSummaryCard';
import UrgentAlerts from '../components/UrgentAlerts';
import AppShortcuts from '../components/AppShortcuts';
import DailyActions from '../components/DailyActions';
import { AqiLineChart } from '../components/AqiCharts';
import AqiSettingsModal from '../components/AqiSettingsModal';
import CustomHeader from '../../../components/CustomHeader'; 

const HomeScreen = ({ navigation }) => {
  const [aqiData, setAqiData] = useState(null);
  const [chartData, setChartData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Đang định vị...");
  const [modalVisible, setModalVisible] = useState(false);

  const threshold = useAqiStore((state) => state.threshold);
  const { sendAlert } = useNotifications();
  const userProfile = useUserStore((state) => state.userProfile);

  const checkAndAlert = (data) => {
    if (!data) return;
    const pm25 = data.components.pm2_5;
    if (pm25 > threshold) {
      sendAlert("⚠️ Cảnh báo chất lượng không khí!", `Chỉ số PM2.5 là ${pm25.toFixed(1)}, vượt quá ngưỡng an toàn.`);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Cần quyền vị trí", "Vui lòng cấp quyền để xem AQI tại nơi bạn ở.");
        setLocationName("TP.HCM (Mặc định)");
        const defaultCoords = { latitude: 10.762, longitude: 106.660 };
        const data = await fetchAqiDataByCoords(defaultCoords.latitude, defaultCoords.longitude);
        setAqiData(data);
        await loadChartHistory(defaultCoords.latitude, defaultCoords.longitude);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      let address = await Location.reverseGeocodeAsync(location.coords);
      if(address.length > 0) {
        setLocationName(`${address[0].subAdminArea || ''}, ${address[0].region || ''}`);
      } else {
        setLocationName("Vị trí của bạn");
      }

      const data = await fetchAqiDataByCoords(location.coords.latitude, location.coords.longitude);
      setAqiData(data);
      
      checkAndAlert(data);

      await loadChartHistory(location.coords.latitude, location.coords.longitude);

    } catch (error) {
      console.error("Lỗi lấy vị trí/API:", error);
      setLocationName("Lỗi định vị");
      const defaultCoords = { latitude: 10.762, longitude: 106.660 };
      const data = await fetchAqiDataByCoords(defaultCoords.latitude, defaultCoords.longitude);
      setAqiData(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadChartHistory = async (lat, lon) => {
      try {
          const end = Math.floor(Date.now() / 1000);
          const start = end - (24 * 3600); 
          const history = await fetchAqiHistory(lat, lon, start, end);
          
          if (history && history.list) {
              const labels = [];
              const dataPoints = [];
              const step = 4; 
              for (let i = 0; i < history.list.length; i += step) {
                  const item = history.list[i];
                  const date = new Date(item.dt * 1000);
                  labels.push(`${date.getHours()}h`);
                  dataPoints.push(item.components.pm2_5);
              }
              setChartData({
                  labels: labels.slice(-6), 
                  datasets: [{ data: dataPoints.slice(-6) }]
              });
          }
      } catch (e) {
          console.log("Chart Error:", e);
      }
  };

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
              <Text style={{textAlign:'center', color:'#999', padding: 20}}>Đang tải biểu đồ...</Text>
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