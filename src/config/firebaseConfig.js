// src/config/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC3eG8zT3gHc4x1x5m_aY0AIXKhdJ-tl-U",
  authDomain: "ecoapp-dc865.firebaseapp.com",
  databaseURL: "https://ecoapp-dc865-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecoapp-dc865",
  storageBucket: "ecoapp-dc865.appspot.com",
  messagingSenderId: "982272940577",
  appId: "1:982272940577:web:925ea42aae240a84d82160",
  measurementId: "G-DQ5VXF8C7X"
};

// 1. Kiểm tra xem App đã được khởi tạo chưa để tránh lỗi "App already exists"
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 2. Khởi tạo Auth với Persistence (QUAN TRỌNG CHO MOBILE)
// Dùng try-catch để tránh lỗi nếu Auth đã được khởi tạo trước đó
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // Nếu đã có auth instance thì lấy lại cái cũ
  auth = getAuth(app); 
}

// 3. Khởi tạo Database
const database = getDatabase(app);

export { auth, database };