import { create } from 'zustand';
import { auth, db } from '../config/firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
        // Dữ liệu mặc định (Stats = 0)
        const defaultData = {
          displayName: auth.currentUser?.email?.split('@')[0] || "User Name",
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

      // Cập nhật state local để UI đổi ngay
      set((state) => ({
        userProfile: { ...state.userProfile, ...data }
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // --- HÀM UPLOAD MỚI DÙNG CLOUDINARY ---
  uploadAvatar: async (uri) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !uri) return { success: false, error: "No user or URI" };

    try {
      console.log("1. Bắt đầu upload lên Cloudinary...");

      // Tạo form data để gửi file
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg', // Hoặc lấy type từ kết quả picker
        name: `avatar_${uid}.jpg`,
      });
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      // Gọi API Cloudinary
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

        // Cập nhật link ảnh vào Firestore (Giữ nguyên logic cũ)
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

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },
}));