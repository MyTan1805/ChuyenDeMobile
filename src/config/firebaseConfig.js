<<<<<<< HEAD
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
  databaseURL: "https://ecoapp-dc865-default-rtdb.asia-southeast1.firebasedatabase.app",
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
=======
// Import getApps và getApp để kiểm tra instance cũ
import { initializeApp, getApps, getApp } from "firebase/app";
// Import các module cần thiết
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// --- CẤU HÌNH TRỰC TIẾP (HARDCODED) ---
// Đã điền sẵn thông tin của bạn để đảm bảo kết nối 100%
const firebaseConfig = {
  apiKey: "AIzaSyC3eG8zT3gHc4x1x5m_aY0AIXKhdJ-tl-U",
  authDomain: "ecoapp-dc865.firebaseapp.com",
  databaseURL: "https://ecoapp-dc865-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecoapp-dc865",
  storageBucket: "ecoapp-dc865.firebasestorage.app", // Lưu ý: Tôi đã đổi đuôi thành .firebasestorage.app để upload ảnh ổn định hơn
  messagingSenderId: "982272940577",
  appId: "1:982272940577:web:925ea42aae240a84d82160",
  measurementId: "G-DQ5VXF8C7X"
};

// 1. Khởi tạo App (Kiểm tra xem đã có App nào chưa để tránh lỗi duplicate)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 2. Khởi tạo Auth
let auth;
try {
  // Chỉ khởi tạo persistence nếu chưa có auth instance
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // Nếu auth đã tồn tại (do hot reload), lấy instance cũ
  auth = getAuth(app);
}

// 3. Khởi tạo Database & Storage
const db = getFirestore(app);
const storage = getStorage(app);

// 4. Xuất biến
export { app, auth, db, storage };
>>>>>>> dev/Bao
