// src/hooks/useSystemNotifications.js

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { userStore } from '../store/userStore'; // ← Chỉ cái này dùng instance
import { fetchAqiDataByCoords } from '../features/aqi/api/aqiApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSystemNotifications = () => {
  useEffect(() => {
    const checkAQI = async () => {
      const state = userStore.getState();
      const userProfile = state.userProfile;
      const addNotificationToHistory = state.addNotificationToHistory;

      if (!userProfile?.notificationSettings?.weather) return;

      const aqiThreshold = parseInt(userProfile.aqiSettings?.threshold || "150");

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const location = await Location.getCurrentPositionAsync({});
        const data = await fetchAqiDataByCoords(location.coords.latitude, location.coords.longitude);

        if (data?.list?.[0]) {
          const pm25 = data.list[0].components.pm2_5;
          const currentAQI = Math.round(pm25 * 3.5);
          const today = new Date().toDateString();
          const lastCheck = await AsyncStorage.getItem('LAST_AQI_WARNING_DATE');

          if (currentAQI > aqiThreshold && lastCheck !== today) {
            const notiContent = {
              title: `Cảnh báo ô nhiễm: AQI ${currentAQI}`,
              body: `Không khí đang ở mức KÉM. Hãy đeo khẩu trang.`,
              data: { screen: 'AqiDetail' },
            };

            await Notifications.scheduleNotificationAsync({
              content: { ...notiContent, sound: true },
              trigger: null,
            });

            if (typeof addNotificationToHistory === 'function') {
              await addNotificationToHistory({
                type: 'weather',
                ...notiContent,
                createdAt: new Date().toISOString(),
                isRead: false,
              });
            }

            await AsyncStorage.setItem('LAST_AQI_WARNING_DATE', today);
          }
        }
      } catch (error) {
        console.log("AQI Check Error:", error);
      }
    };

    // Chạy ngay và theo dõi thay đổi
    checkAQI();
    const unsubscribe = userStore.subscribe((state) => {
      if (state.userProfile?.notificationSettings?.weather) {
        checkAQI();
      }
    });

    return () => unsubscribe();
  }, []);
};