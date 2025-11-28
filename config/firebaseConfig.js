import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Thay thế bằng thông tin từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyC3eG8zT3gHc4x1x5m_aY0AIXKhdJ-tl-U",
  authDomain: "ecoapp-dc865.firebaseapp.com",
  projectId: "ecoapp-dc865",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "982272940577",
  appId: "1:982272940577:android:4f457b6458cf735cd82160"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);