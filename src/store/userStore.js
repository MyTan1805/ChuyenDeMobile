// src/store/userStore.js
import { create } from 'zustand';

// --- SỬA LỖI TẠI ĐÂY: Gộp tất cả import từ firebaseConfig vào 1 dòng duy nhất ---
import { auth, db, storage } from '../config/firebaseConfig';

import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'; // Đã thêm 'increment'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  // HÀM MỚI: Cập nhật điểm cho người dùng
  addPointsToUser: async (pointsToAdd) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: "User not authenticated" };

    try {
      const docRef = doc(db, "users", uid);
      
      // Sử dụng increment để cập nhật số điểm một cách an toàn
      await updateDoc(docRef, {
        "stats.points": increment(pointsToAdd)
      });

      // Cập nhật state local ngay lập tức
      set((state) => ({
        userProfile: {
          ...state.userProfile,
          stats: {
            ...state.userProfile.stats,
            points: (state.userProfile.stats.points || 0) + pointsToAdd
          }
        }
      }));

      return { success: true };
    } catch (error) {
      console.error("Lỗi cộng điểm:", error);
      return { success: false, error: error.message };
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

  uploadAvatar: async (uri) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !uri) {
      return { success: false, error: "No user or URI" };
    }

    try {
      console.log("=== UPLOAD AVATAR ===");
      console.log("URI:", uri);

      // 1. Fetch ảnh và chuyển sang Blob
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Fetch failed");

      const blob = await response.blob();
      console.log("Blob type:", blob.type, "Size:", blob.size);

      // 2. Đường dẫn storage đơn giản
      const filename = `avatars/${uid}_${Date.now()}.jpg`;
      console.log("Path:", filename);

      // 3. Tạo storage reference
      const storageRef = ref(storage, filename);

      // 4. Upload với metadata rõ ràng
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedBy: uid,
          uploadedAt: new Date().toISOString()
        }
      };

      await uploadBytes(storageRef, blob, metadata);
      console.log("✅ Upload thành công!");

      // 5. Lấy URL
      const downloadURL = await getDownloadURL(storageRef);

      // 6. Cập nhật Firestore
      await get().updateUserProfile({ photoURL: downloadURL });

      return { success: true, url: downloadURL };

    } catch (error) {
      console.error("=== LỖI UPLOAD ===");
      console.error("Error:", error);
      console.error("Code:", error.code);
      console.error("Message:", error.message);

      // Log server response nếu có
      if (error.serverResponse) {
        console.error("Server:", error.serverResponse);
      }

      return { success: false, error: error.message };
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