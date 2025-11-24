import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // <--- THÊM DÒNG NÀY
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Import các biến môi trường
import { 
  API_KEY, 
  AUTH_DOMAIN, 
  DATABASE_URL, 
  PROJECT_ID, 
  STORAGE_BUCKET, 
  MESSAGING_SENDER_ID, 
  APP_ID, 
  MEASUREMENT_ID 
} from '@env';

// --- Cấu hình Firebase đọc từ .env ---
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  databaseURL: DATABASE_URL,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID
};

// --- Khởi tạo Dịch vụ ---
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// --- Khởi tạo Realtime Database ---
const database = getDatabase(app); // <--- THÊM DÒNG NÀY

// Export database để các màn hình khác sử dụng
export { app, auth, database }; // <--- THÊM 'database' VÀO ĐÂY