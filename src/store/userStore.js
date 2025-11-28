<<<<<<< HEAD
// src/store/userStore.js
=======
>>>>>>> dev/Bao
import { create } from 'zustand';
import { auth, db, storage } from '../config/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
<<<<<<< HEAD
  signInAnonymously,
  updatePassword,
  deleteUser,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

// ✅ ĐÃ SỬA: Import đầy đủ các hàm cần thiết từ firestore
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, getDocs,
  increment
} from 'firebase/firestore';

import * as Notifications from 'expo-notifications';

=======
  signInAnonymously // <-- 1. Import thêm cái này
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendPasswordResetEmail } from 'firebase/auth';

// --- CẤU HÌNH CLOUDINARY ---
>>>>>>> dev/Bao
const CLOUD_NAME = "dqpyrygyu";
const UPLOAD_PRESET = "ecoapp_preset";

export const useUserStore = create((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,

<<<<<<< HEAD
  // --- 1. LOGIC AUTH CƠ BẢN ---
=======
>>>>>>> dev/Bao
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

<<<<<<< HEAD
  register: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error };
    }
  },

  checkVerificationStatus: async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.reload();
        const refreshedUser = auth.currentUser;
        set({ user: refreshedUser });
        return refreshedUser.emailVerified;
      } catch (error) {
        console.log("Lỗi reload user:", error);
        return false;
      }
    }
    return false;
  },

  sendVerification: async (userInput) => {
    const user = userInput || auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }
    return { success: false, error: 'No user found' };
  },

=======
>>>>>>> dev/Bao
  fetchUserProfile: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ userProfile: docSnap.data(), isLoading: false });
      } else {
<<<<<<< HEAD
=======
        // Dữ liệu mặc định (Nếu là Guest thì email là null -> Lấy tên mặc định)
>>>>>>> dev/Bao
        const defaultData = {
          displayName: auth.currentUser?.email?.split('@')[0] || "Khách ghé thăm",
          location: "Chưa cập nhật",
          phoneNumber: "",
          photoURL: "",
<<<<<<< HEAD
          isLocationShared: false,
          aqiSettings: {
            isEnabled: true,
            threshold: "150"
          },
          notificationSettings: {
            weather: false,
            trash: false,
            campaign: false,
            community: false
          },
          createdAt: new Date().toISOString(),
          stats: {
            points: 0, sentReports: 0, trashSorted: 0, community: 0, levelProgress: 0,
=======
          createdAt: new Date().toISOString(),
          stats: {
            points: 0,
            sentReports: 0,
            trashSorted: 0,
            community: 0,
            levelProgress: 0,
>>>>>>> dev/Bao
            communityStats: [
              { label: 'T1', report: 0, recycle: 0 },
              { label: 'T2', report: 0, recycle: 0 },
              { label: 'T3', report: 0, recycle: 0 },
              { label: 'T4', report: 0, recycle: 0 },
              { label: 'T5', report: 0, recycle: 0 },
            ]
<<<<<<< HEAD
          },
          reportHistory: [],
          chatHistory: []
=======
          }
>>>>>>> dev/Bao
        };
        await setDoc(docRef, defaultData);
        set({ userProfile: defaultData, isLoading: false });
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      set({ isLoading: false });
    }
  },

<<<<<<< HEAD
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

=======
>>>>>>> dev/Bao
  updateUserProfile: async (data) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, data);
<<<<<<< HEAD
      set((state) => ({ userProfile: { ...state.userProfile, ...data } }));
=======

      set((state) => ({
        userProfile: { ...state.userProfile, ...data }
      }));
>>>>>>> dev/Bao
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  uploadAvatar: async (uri) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !uri) return { success: false, error: "No user or URI" };
<<<<<<< HEAD
    try {
      const formData = new FormData();
      formData.append('file', { uri: uri, type: 'image/jpeg', name: `avatar_${uid}.jpg` });
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      if (data.secure_url) {
        await get().updateUserProfile({ photoURL: data.secure_url });
        return { success: true, url: data.secure_url };
      } else {
        return { success: false, error: "Upload failed" };
      }
    } catch (error) {
=======

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
>>>>>>> dev/Bao
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
<<<<<<< HEAD
      return { success: false, error };
    }
  },

=======
      return { success: false, error: error };
    }
  },

  // --- 2. HÀM ĐĂNG NHẬP KHÁCH MỚI ---
>>>>>>> dev/Bao
  loginGuest: async () => {
    try {
      await signInAnonymously(auth);
      return { success: true };
    } catch (error) {
<<<<<<< HEAD
      return { success: false, error };
=======
      return { success: false, error: error };
>>>>>>> dev/Bao
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },
<<<<<<< HEAD

  updateUserSettings: async (settingsData) => {
    return await get().updateUserProfile(settingsData);
  },

  changeUserPassword: async (newPassword) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "No user" };
    try {
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  resetUserData: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: "No user" };
    try {
      const resetData = {
        displayName: auth.currentUser?.email?.split('@')[0] || "Người dùng",
        location: "",
        phoneNumber: "",
        photoURL: "",
        isLocationShared: false,
        updatedAt: new Date().toISOString(),
        stats: {
          points: 0, sentReports: 0, trashSorted: 0, community: 0, levelProgress: 0,
          communityStats: [
            { label: 'T1', report: 0, recycle: 0 },
            { label: 'T2', report: 0, recycle: 0 },
            { label: 'T3', report: 0, recycle: 0 },
            { label: 'T4', report: 0, recycle: 0 },
            { label: 'T5', report: 0, recycle: 0 },
          ]
        },
        reportHistory: [],
        chatHistory: []
      };
      await setDoc(doc(db, "users", uid), resetData);
      set({ userProfile: resetData });
      return { success: true };
    } catch (error) {
      console.log("Lỗi reset data:", error);
      return { success: false, error };
    }
  },

  deleteUserAccount: async () => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "No user" };
    try {
      const uid = user.uid;
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(user);
      set({ user: null, userProfile: null });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // --- PHẦN LẤY DỮ LIỆU THỰC TỪ FIRESTORE ---

  // 1. Lấy chỉ số AQI mới nhất từ collection 'aqi_data'
  getRealtimeAQI: async () => {
    try {
      const q = query(collection(db, "aqi_data"), orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log("Dữ liệu AQI lấy được:", data.aqi);
        return data.aqi || 0;
      }
      return 0;
    } catch (e) {
      console.log("Lỗi lấy AQI từ Firestore:", e);
      return 0;
    }
  },

  // 2. Lấy lịch thu rác
  getTrashSchedule: async () => {
    try {
      const q = query(collection(db, "schedules"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
      return null;
    } catch (e) {
      console.log("Chưa có collection schedules");
      return null;
    }
  },

  // 3. Lấy chiến dịch mới nhất
  getLatestCampaign: async () => {
    try {
      const q = query(collection(db, "campaigns"), where("isActive", "==", true), orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
      return null;
    } catch (e) { return null; }
  },

  // 4. Đếm sự kiện cộng đồng sắp tới
  countActiveEvents: async () => {
    try {
      const today = new Date();
      const q = query(collection(db, "events"), where("date", ">=", today));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (e) { return 0; }
  },

  // --- TRIGGER NOTIFICATION ---
  triggerDynamicNotification: async (type) => {
    // 1. Lấy các hàm helper và dữ liệu từ Store
    const { userProfile, getRealtimeAQI, getLatestCampaign, countActiveEvents, getTrashSchedule } = get();

    // 2. Lấy ngưỡng cài đặt (Mặc định 150 nếu chưa set)
    const aqiSettings = userProfile?.aqiSettings || { threshold: "150" };
    const userThreshold = parseInt(aqiSettings.threshold);

    let content = null;

    switch (type) {
      case 'weather':
        const currentAQI = await getRealtimeAQI();
        
        // So sánh AQI thực tế với ngưỡng user cài
        if (currentAQI > userThreshold) {
          content = {
            title: `⚠️ Cảnh báo AQI: ${currentAQI}`,
            body: `Chỉ số ô nhiễm ${currentAQI} đã vượt ngưỡng an toàn (${userThreshold}) của bạn.`,
            // SỬA: Điều hướng đến màn hình Chi tiết AQI
            data: { screen: 'AqiDetail' } 
          };
        } else {
          content = {
            title: `✅ Không khí ổn định`,
            body: `AQI hiện tại là ${currentAQI}. Thấp hơn ngưỡng cảnh báo (${userThreshold}) của bạn.`,
            data: { screen: 'AqiDetail' }
          };
        }
        break;

      case 'trash':
        const schedule = await getTrashSchedule();
        if (schedule) {
          content = {
            title: `🚛 Lịch thu gom: ${schedule.type || 'Rác sinh hoạt'}`,
            body: `Xe rác dự kiến đến vào lúc ${schedule.time || 'tối nay'}. Hãy chuẩn bị rác nhé!`,
            // SỬA: Điều hướng về Tab Cộng đồng (nơi có phân loại rác)
            data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } }
          };
        } else {
          content = {
            title: "🚛 Nhắc nhở rác",
            body: "Hãy kiểm tra lịch thu gom rác tại địa phương hôm nay.",
            data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } }
          };
        }
        break;

      case 'campaign':
        const campaign = await getLatestCampaign();
        if (campaign) {
          content = {
            title: `🌱 Chiến dịch mới: ${campaign.name}`,
            body: `Tham gia ngay để nhận thưởng ${campaign.reward || 0} điểm xanh!`,
            // SỬA: Điều hướng về Tab Cộng đồng
            data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } }
          };
        } else {
          content = { 
            title: "🌱 EcoMate", 
            body: "Hiện chưa có chiến dịch mới, hãy quay lại sau nhé!",
            data: { screen: 'MainTabs', params: { screen: 'Trang chủ' } }
          };
        }
        break;

      case 'community':
        const eventCount = await countActiveEvents();
        if (eventCount > 0) {
          content = {
            title: `🔥 Cộng đồng sôi nổi`,
            body: `Đang có ${eventCount} sự kiện xanh sắp diễn ra. Tham gia ngay để kết nối!`,
            // SỬA: Điều hướng về Tab Cộng đồng
            data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } }
          };
        } else {
          content = { 
            title: "🔥 Cộng đồng", 
            body: "Hãy là người đầu tiên tạo bài viết mới hôm nay!",
            // SỬA: Điều hướng về màn hình Đăng bài
            data: { screen: 'MainTabs', params: { screen: 'Đăng tin' } }
          };
        }
        break;
    }

    // 3. Thực hiện gửi thông báo qua Expo Notifications
    if (content) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          // Quan trọng: Dữ liệu này sẽ được Hook useNotifications bắt lấy để điều hướng
          data: content.data || {} 
        },
        trigger: null, // Gửi ngay lập tức (hoặc chỉnh trigger: { seconds: 5 } để test)
      });
    }
  },
=======
>>>>>>> dev/Bao
}));