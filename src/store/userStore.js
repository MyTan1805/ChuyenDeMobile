import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, storage } from '../config/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updatePassword,
  deleteUser,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';

import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, getDocs, increment,
  arrayUnion
} from 'firebase/firestore';

const CLOUD_NAME = "dqpyrygyu";
const UPLOAD_PRESET = "ecoapp_preset";
const GUEST_DATA_KEY = "guest_user_data"; // Key để lưu dữ liệu khách cục bộ

// --- Helper: Tạo dữ liệu mặc định (Dùng chung cho cả Guest và User mới) ---
const getDefaultUserData = (displayName) => ({
  displayName: displayName || "Người dùng",
  location: "Chưa cập nhật",
  phoneNumber: "",
  photoURL: "",
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
});

export const useUserStore = create((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,

  // --- 1. LOGIC AUTH CƠ BẢN ---
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

  // --- 2. LOGIC LẤY PROFILE (XỬ LÝ RIÊNG CHO GUEST) ---
  fetchUserProfile: async (uid) => {
    const user = auth.currentUser;

    // TRƯỜNG HỢP 1: KHÁCH (Lưu cục bộ AsyncStorage)
    if (user && user.isAnonymous) {
      try {
        const storedData = await AsyncStorage.getItem(GUEST_DATA_KEY);
        if (storedData) {
          set({ userProfile: JSON.parse(storedData), isLoading: false });
        } else {
          // Nếu chưa có dữ liệu khách, tạo mới và lưu
          const defaultData = getDefaultUserData("Khách ghé thăm");
          await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(defaultData));
          set({ userProfile: defaultData, isLoading: false });
        }
      } catch (e) {
        console.error("Lỗi lấy dữ liệu khách:", e);
        set({ isLoading: false });
      }
      return;
    }

    // TRƯỜNG HỢP 2: USER ĐĂNG KÝ (Lưu Firestore)
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ userProfile: docSnap.data(), isLoading: false });
      } else {
        const defaultData = getDefaultUserData(auth.currentUser?.email?.split('@')[0]);
        await setDoc(docRef, defaultData);
        set({ userProfile: defaultData, isLoading: false });
      }
    } catch (error) {
      console.error("Lỗi lấy profile Firestore:", error);
      set({ isLoading: false });
    }
  },

  // --- 3. LOGIC CỘNG ĐIỂM (XỬ LÝ RIÊNG CHO GUEST) ---
  addPointsToUser: async (pointsToAdd) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "User not authenticated" };

    // Cập nhật State Local trước để UI phản hồi nhanh
    const currentProfile = get().userProfile;
    const newPoints = (currentProfile?.stats?.points || 0) + pointsToAdd;

    const newProfileState = {
      ...currentProfile,
      stats: {
        ...currentProfile.stats,
        points: newPoints
      }
    };
    set({ userProfile: newProfileState });

    // KHÁCH: Lưu vào AsyncStorage
    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfileState));
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // USER THẬT: Lưu vào Firestore (Dùng increment để an toàn atomic)
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        "stats.points": increment(pointsToAdd)
      });
      return { success: true };
    } catch (error) {
      console.error("Lỗi cộng điểm:", error);
      return { success: false, error: error.message };
    }
  },

  // --- 4. LOGIC CẬP NHẬT PROFILE (XỬ LÝ RIÊNG CHO GUEST) ---
  updateUserProfile: async (data) => {
    const user = auth.currentUser;
    if (!user) return;

    // Cập nhật State
    const newProfile = { ...get().userProfile, ...data };
    set({ userProfile: newProfile });

    // KHÁCH: Lưu vào AsyncStorage
    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
        return { success: true };
      } catch (e) {
        return { success: false, error: e };
      }
    }

    // USER THẬT: Lưu vào Firestore
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  uploadAvatar: async (uri) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !uri) return { success: false, error: "No user or URI" };

    // Lưu ý: Khách vẫn cho phép upload ảnh tạm thời (hoặc có thể chặn nếu muốn tiết kiệm dung lượng cloud)
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
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  loginGuest: async () => {
    try {
      await signInAnonymously(auth);
      // Không cần tạo dữ liệu ở đây, hàm fetchUserProfile sẽ tự tạo data local
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },

  updateUserSettings: async (settingsData) => {
    return await get().updateUserProfile(settingsData);
  },

  changeUserPassword: async (newPassword) => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return { success: false, error: "Not allowed for guest" };
    try {
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // --- 5. LOGIC RESET DATA (XỬ LÝ RIÊNG CHO GUEST) ---
  resetUserData: async () => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "No user" };

    const resetData = getDefaultUserData(get().userProfile.displayName);
    set({ userProfile: resetData });

    // KHÁCH: Ghi đè AsyncStorage
    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(resetData));
        return { success: true };
      } catch (e) {
        return { success: false, error: e };
      }
    }

    // USER THẬT: Ghi đè Firestore
    try {
      await setDoc(doc(db, "users", user.uid), resetData);
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
      if (user.isAnonymous) {
        // KHÁCH: Xóa data local
        await AsyncStorage.removeItem(GUEST_DATA_KEY);
      } else {
        // USER THẬT: Xóa document Firestore
        const uid = user.uid;
        await deleteDoc(doc(db, "users", uid));
      }

      await deleteUser(user);
      set({ user: null, userProfile: null });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // --- CÁC HÀM LẤY DỮ LIỆU CHUNG (READ-ONLY TỪ FIRESTORE) ---
  // Các hàm này Khách vẫn gọi được bình thường để xem thông tin chung

  getRealtimeAQI: async () => {
    try {
      const q = query(collection(db, "aqi_data"), orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().aqi || 0;
      }
      return 0;
    } catch (e) { return 0; }
  },

  getTrashSchedule: async () => {
    try {
      const q = query(collection(db, "schedules"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data();
      return null;
    } catch (e) { return null; }
  },

  getLatestCampaign: async () => {
    try {
      const q = query(collection(db, "campaigns"), where("isActive", "==", true), orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data();
      return null;
    } catch (e) { return null; }
  },

  countActiveEvents: async () => {
    try {
      const today = new Date();
      const q = query(collection(db, "events"), where("date", ">=", today));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (e) { return 0; }
  },

  triggerDynamicNotification: async (type) => {
    const { userProfile, getRealtimeAQI, getLatestCampaign, countActiveEvents, getTrashSchedule } = get();
    const aqiSettings = userProfile?.aqiSettings || { threshold: "150" };
    const userThreshold = parseInt(aqiSettings.threshold);
    let content = null;

    switch (type) {
      case 'weather':
        const currentAQI = await getRealtimeAQI();
        if (currentAQI > userThreshold) {
          content = {
            title: `⚠️ Cảnh báo AQI: ${currentAQI}`,
            body: `Chỉ số ô nhiễm ${currentAQI} đã vượt ngưỡng an toàn (${userThreshold}) của bạn.`,
            data: { screen: 'HomeScreen' }
          };
        } else {
          content = {
            title: `✅ Không khí ổn định`,
            body: `AQI hiện tại là ${currentAQI}. Thấp hơn ngưỡng cảnh báo (${userThreshold}) của bạn.`,
            data: { screen: 'HomeScreen' }
          };
        }
        break;
      // ... Các case khác giữ nguyên
      case 'trash':
        const schedule = await getTrashSchedule();
        if (schedule) {
          content = {
            title: `🚛 Lịch thu gom: ${schedule.type || 'Rác sinh hoạt'}`,
            body: `Xe rác dự kiến đến vào lúc ${schedule.time || 'tối nay'}.`,
            data: { screen: 'Community' }
          };
        }
        break;
      case 'campaign':
        const campaign = await getLatestCampaign();
        if (campaign) {
          content = {
            title: `🌱 Chiến dịch mới: ${campaign.name}`,
            body: `Tham gia ngay để nhận thưởng ${campaign.reward || 0} điểm xanh!`,
            data: { screen: 'Post' }
          };
        }
        break;
      case 'community':
        const eventCount = await countActiveEvents();
        if (eventCount > 0) {
          content = {
            title: `🔥 Cộng đồng sôi nổi`,
            body: `Đang có ${eventCount} sự kiện xanh sắp diễn ra.`,
            data: { screen: 'Community' }
          };
        }
        break;
    }

    if (content) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: content.data || {}
        },
        trigger: null,
      });
    }
  },

  loginWithGoogle: async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      // Lưu user vào Zustand store
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error };
    }
  },

  addReportToHistory: async (reportData) => {
    const user = auth.currentUser;
    const currentProfile = get().userProfile;
    if (!currentProfile) return;

    const newReport = {
      id: Date.now().toString(),
      time: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      status: 'pending',
      title: reportData.title,
      type: reportData.type,
      description: reportData.description,
      location: reportData.location,
      severity: reportData.severity,
      images: reportData.images || []
    };

    const newHistory = [newReport, ...(currentProfile.reportHistory || [])];
    const newStats = {
      ...currentProfile.stats,
      sentReports: (currentProfile.stats?.sentReports || 0) + 1
    };
    const newProfile = { ...currentProfile, reportHistory: newHistory, stats: newStats };
    set({ userProfile: newProfile });

    if (user && user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
        return { success: true };
      } catch (e) { return { success: false, error: e }; }
    } else if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          reportHistory: arrayUnion(newReport),
          "stats.sentReports": increment(1)
        });
        return { success: true };
      } catch (e) { return { success: false, error: e }; }
    }
  },

  addChatToHistory: async (messages) => {
    const user = auth.currentUser;
    const currentProfile = get().userProfile;
    if (!currentProfile || !messages || messages.length === 0) return;

    const firstUserMsg = messages.find(m => m.sender === 'user');
    const title = firstUserMsg ? firstUserMsg.text : "Đoạn chat mới";

    const newChatSession = {
      id: Date.now().toString(),
      time: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      name: title,
      messages: messages // Lưu toàn bộ để xem lại
    };

    const newHistory = [newChatSession, ...(currentProfile.chatHistory || [])];
    const newProfile = { ...currentProfile, chatHistory: newHistory };
    set({ userProfile: newProfile });

    if (user && user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
        return { success: true };
      } catch (e) { return { success: false, error: e }; }
    } else if (user) {
      try {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          chatHistory: arrayUnion(newChatSession)
        });
        return { success: true };
      } catch (e) { return { success: false, error: e }; }
    }
  },

  // Xóa báo cáo
  deleteReport: async (reportId) => {
    const { user, userProfile } = get();
    if (!userProfile) return { success: false, error: "No profile" };

    // Lọc bỏ item
    const newHistory = userProfile.reportHistory.filter(item => item.id !== reportId);
    const newProfile = { ...userProfile, reportHistory: newHistory };
    set({ userProfile: newProfile });

    try {
      if (user && user.isAnonymous) {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
      } else if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, { reportHistory: newHistory });
      }
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },

  // Xóa lịch sử chat
  deleteChatSession: async (sessionId) => {
    const { user, userProfile } = get();
    if (!userProfile) return { success: false, error: "No profile" };

    const newHistory = userProfile.chatHistory.filter(item => item.id !== sessionId);
    const newProfile = { ...userProfile, chatHistory: newHistory };
    set({ userProfile: newProfile });

    try {
      if (user && user.isAnonymous) {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
      } else if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, { chatHistory: newHistory });
      }
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },
}));