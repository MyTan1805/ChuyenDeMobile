import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database'; // Realtime Database
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from '@env';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

// --- SINGLETON PATTERN (Chỉ khởi tạo 1 lần duy nhất) ---
let app;
let auth;

if (getApps().length === 0) {
  // Nếu chưa có App nào, khởi tạo mới
  app = initializeApp(firebaseConfig);
  
  // Khởi tạo Auth với AsyncStorage (để giữ đăng nhập khi tắt app)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  // Nếu đã có, lấy App hiện tại
  app = getApp();
  auth = getAuth(app);
}

// --- Khởi tạo các dịch vụ khác từ 'app' đã có ---
const db = getFirestore(app);       // Firestore
const storage = getStorage(app);    // Storage (Ảnh, Video)
const database = getDatabase(app);  // Realtime Database

// Export tất cả ra để dùng
export { app, auth, db, storage, database };