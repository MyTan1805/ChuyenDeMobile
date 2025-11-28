<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

=======
// src/hooks/useNotifications.js
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Cấu hình hiển thị khi App đang mở
>>>>>>> dev/Bao
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
<<<<<<< HEAD
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();

  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
=======
  
  // 1. Hàm xin quyền (chạy 1 lần khi app khởi động)
  const registerForPushNotifications = async () => {
    let { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

>>>>>>> dev/Bao
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
<<<<<<< HEAD
    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
=======

    if (finalStatus !== 'granted') {
      console.log('Không có quyền thông báo!');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
>>>>>>> dev/Bao
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

<<<<<<< HEAD
  // Hàm gửi thông báo ngay
  const sendAlert = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  };

  // Hàm hẹn giờ (cho lịch rác)
  const scheduleReminder = async (title, body, seconds) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds: seconds },
    });
  };

  useEffect(() => {
    registerForPushNotifications();

    // 1. Nhận thông báo khi App mở
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // 2. Xử lý khi bấm vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        navigation.navigate(data.screen, data.params);
      } else if (data?.type === 'weather') {
         navigation.navigate('AqiDetail'); // Nhảy sang chi tiết AQI
      }
    });

    // Clean up chuẩn (Sửa lỗi crash)
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { sendAlert, scheduleReminder };
=======
  // 2. Hàm gửi thông báo
  const sendAlert = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Gửi ngay lập tức
    });
  };

  // Tự động xin quyền khi hook được gọi lần đầu
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return { sendAlert };
>>>>>>> dev/Bao
};