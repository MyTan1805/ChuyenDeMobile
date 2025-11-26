import { create } from 'zustand';
import { auth, db, storage } from '../config/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously // <-- 1. Import thêm cái này
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendPasswordResetEmail } from 'firebase/auth';

// --- CẤU HÌNH CLOUDINARY ---
const CLOUD_NAME = "dqpyrygyu";
const UPLOAD_PRESET = "ecoapp_preset";

export const useUserStore = create((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,

  checkAuthState: () => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        await get().fetchUserProfile(user.uid);
      } else {
        set({ user: null, userProfile: null, isLoading: false });
      }
    });
  },

  fetchUserProfile: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ userProfile: docSnap.data(), isLoading: false });
      } else {
        // Dữ liệu mặc định (Nếu là Guest thì email là null -> Lấy tên mặc định)
        const defaultData = {
          displayName: auth.currentUser?.email?.split('@')[0] || "Khách ghé thăm",
          location: "Chưa cập nhật",
          phoneNumber: "",
          photoURL: "",
          createdAt: new Date().toISOString(),
          stats: {
            points: 0,
            sentReports: 0,
            trashSorted: 0,
            community: 0,
            levelProgress: 0,
            communityStats: [
              { label: 'T1', report: 0, recycle: 0 },
              { label: 'T2', report: 0, recycle: 0 },
              { label: 'T3', report: 0, recycle: 0 },
              { label: 'T4', report: 0, recycle: 0 },
              { label: 'T5', report: 0, recycle: 0 },
            ]
          }
        };
        await setDoc(docRef, defaultData);
        set({ userProfile: defaultData, isLoading: false });
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      set({ isLoading: false });
    }
  },

  updateUserProfile: async (data) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, data);

      set((state) => ({
        userProfile: { ...state.userProfile, ...data }
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  uploadAvatar: async (uri) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !uri) return { success: false, error: "No user or URI" };

    try {
      console.log("1. Bắt đầu upload lên Cloudinary...");
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: `avatar_${uid}.jpg`,
      });
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.secure_url) {
        console.log("2. Upload thành công:", data.secure_url);
        await get().updateUserProfile({ photoURL: data.secure_url });
        return { success: true, url: data.secure_url };
      } else {
        console.log("Lỗi Cloudinary:", data);
        return { success: false, error: "Upload failed" };
      }

    } catch (error) {
      console.error("LỖI MẠNG:", error);
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  },

  // --- 2. HÀM ĐĂNG NHẬP KHÁCH MỚI ---
  loginGuest: async () => {
    try {
      await signInAnonymously(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },
}));