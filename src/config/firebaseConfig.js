import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);