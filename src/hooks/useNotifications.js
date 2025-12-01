import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/userStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ✅ QUAN TRỌNG: Phải có chữ export const ở đây
export const useNotifications = () => {
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();
  const { addNotificationToHistory } = useUserStore();

  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const sendAlert = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  };

  const scheduleReminder = async (title, body, seconds) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds: seconds },
    });
  };

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      try {
        const content = notification?.request?.content || {};
        const title = content.title || '';
        const body = content.body || '';
        const data = content.data || {};

        if (addNotificationToHistory) {
          await addNotificationToHistory({ title, body, data });
        }
      } catch (e) {
        console.log('Error saving incoming notification:', e);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        // Logic điều hướng thông minh
        if (data.params) {
            navigation.navigate(data.screen, data.params);
        } else {
            navigation.navigate(data.screen);
        }
      } 
    });

    return () => {
      if (notificationListener.current && typeof notificationListener.current.remove === 'function') {
        notificationListener.current.remove();
      }
      if (responseListener.current && typeof responseListener.current.remove === 'function') {
        responseListener.current.remove();
      }
    };
  }, []);

  return { sendAlert, scheduleReminder };
};