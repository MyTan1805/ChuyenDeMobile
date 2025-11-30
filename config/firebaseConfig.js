import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// --- CẤU HÌNH TRỰC TIẾP (HARDCODED) ---
const firebaseConfig = {
  apiKey: "AIzaSyC3eG8zT3gHc4x1x5m_aY0AIXKhdJ-tl-U",
  authDomain: "ecoapp-dc865.firebaseapp.com",
  databaseURL: "https://ecoapp-dc865-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecoapp-dc865",
  storageBucket: "ecoapp-dc865.firebasestorage.app",
  messagingSenderId: "982272940577",
  appId: "1:982272940577:web:925ea42aae240a84d82160",
  measurementId: "G-DQ5VXF8C7X"
};

// --- [FIX LỖI DUPLICATE APP TRIỆT ĐỂ] ---
let app;

if (getApps().length === 0) {
  try {
    // Nếu chưa có app nào, khởi tạo mới
    app = initializeApp(firebaseConfig);
  } catch (error) {
    // Nếu gặp lỗi duplicate (có thể do race condition), lấy lại app cũ
    if (error.code === 'app/duplicate-app') {
       app = getApp();
    } else {
       throw error; // Quăng lỗi nếu là lỗi khác
    }
  }
} else {
  // Nếu đã có app, lấy app đó ra dùng
  app = getApp();
}

// --- Khởi tạo Auth ---
let auth;
try {
  // Chỉ khởi tạo persistence nếu chưa có auth instance
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // Nếu auth đã tồn tại, lấy instance cũ
  auth = getAuth(app);
}

// --- Khởi tạo Database & Storage ---
const db = getFirestore(app);
const storage = getStorage(app);

// Xuất biến
export { app, auth, db, storage };