// src/hooks/useNotifications.js   ← SỬA LẠI NHƯ SAU (QUAN TRỌNG)

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/userStore'; // ← DÙNG HOOK LẠI, AN TOÀN

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const navigation = useNavigation();
  const { addNotificationToHistory } = useUserStore(); // ← Hook hợp lệ ở đây

  const notificationListener = useRef();
  const responseListener = useRef();

  const registerForPushNotifications = async () => {
    // ... giữ nguyên code cũ
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  // Giữ lại 2 hàm này để các nơi khác dùng
  const sendAlert = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  };

  const scheduleReminder = async (title, body, seconds = 5) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds },
    });
  };

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      const content = notification.request.content;
      if (addNotificationToHistory) {
        await addNotificationToHistory({
          title: content.title || 'Thông báo',
          body: content.body || '',
          data: content.data || {},
          type: 'system',
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        if (data.params) {
          navigation.navigate(data.screen, data.params);
        } else {
          navigation.navigate(data.screen);
        }
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [navigation, addNotificationToHistory]); // ← Thêm dependency

  // QUAN TRỌNG: Return cả 2 hàm
  return { sendAlert, scheduleReminder };
};