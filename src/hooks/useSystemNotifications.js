// src/hooks/useSystemNotifications.js
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { useUserStore } from '../store/userStore';
import { fetchAqiDataByCoords } from '../features/aqi/api/aqiApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSystemNotifications = () => {
  const { userProfile, addNotificationToHistory } = useUserStore();
  const settings = userProfile?.notificationSettings || { weather: true };
  const aqiThreshold = parseInt(userProfile?.aqiSettings?.threshold || "150");

  useEffect(() => {
    const checkAQI = async () => {
      if (!settings.weather) return;
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        
        let location = await Location.getCurrentPositionAsync({});
        const data = await fetchAqiDataByCoords(location.coords.latitude, location.coords.longitude);
        
        if (data && data.list && data.list.length > 0) {
            const pm25 = data.list[0].components.pm2_5;
            const currentAQI = Math.round(pm25 * 3.5);
            
            const today = new Date().toDateString();
            const lastCheck = await AsyncStorage.getItem('LAST_AQI_WARNING_DATE');

            // Logic: Quá ngưỡng VÀ Hôm nay chưa báo
            if (currentAQI > aqiThreshold && lastCheck !== today) {
                const notiContent = {
                    title: `⚠️ Cảnh báo ô nhiễm: AQI ${currentAQI}`,
                    body: `Không khí đang ở mức KÉM. Hãy đeo khẩu trang.`,
                    data: { screen: 'AqiDetail' },
                };

                // 1. Hiện thông báo
                await Notifications.scheduleNotificationAsync({
                    content: { ...notiContent, sound: true },
                    trigger: null,
                });

                // 2. Lưu vào lịch sử (Chạy ngầm)
                if (addNotificationToHistory) {
                    await addNotificationToHistory({
                        type: 'weather',
                        ...notiContent
                    });
                }
                await AsyncStorage.setItem('LAST_AQI_WARNING_DATE', today);
            }
        }
      } catch (error) { console.log("System Notification Error", error); }
    };
    
    // Chạy mỗi khi User Profile thay đổi (hoặc App mở lại)
    if (userProfile) checkAQI();

  }, [settings.weather, aqiThreshold, userProfile]); // Dependency quan trọng
};