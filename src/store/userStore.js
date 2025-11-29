import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Giữ lại cho Guest Mode
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
  arrayUnion, runTransaction
} from 'firebase/firestore';

import * as Notifications from 'expo-notifications';

const CLOUD_NAME = "dqpyrygyu";
const UPLOAD_PRESET = "ecoapp_preset";
const GUEST_DATA_KEY = "guest_user_data";

// --- Helper: Tạo dữ liệu mặc định (Chuẩn hóa cho cả 2 bạn) ---
const getDefaultUserData = (displayName) => ({
  displayName: displayName || "Người dùng",
  location: "Chưa cập nhật",
  phoneNumber: "",
  photoURL: "",
  isLocationShared: false,
  aqiSettings: { isEnabled: true, threshold: "150" },
  notificationSettings: { weather: false, trash: false, campaign: false, community: false },
  createdAt: new Date().toISOString(),
  stats: {
    points: 0, 
    highScore: 0, 
    sentReports: 0, trashSorted: 0, community: 0, levelProgress: 0,
    communityStats: [
      { label: 'T1', report: 0, recycle: 0 },
      { label: 'T2', report: 0, recycle: 0 },
      { label: 'T3', report: 0, recycle: 0 },
      { label: 'T4', report: 0, recycle: 0 },
      { label: 'T5', report: 0, recycle: 0 },
    ]
  },
  quizResults: {}, 
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
    } catch (error) { return { success: false, error }; }
  },

  checkVerificationStatus: async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.reload();
        const refreshedUser = auth.currentUser;
        set({ user: refreshedUser });
        return refreshedUser.emailVerified;
      } catch (error) { return false; }
    }
    return false;
  },

  sendVerification: async (userInput) => {
    const user = userInput || auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        return { success: true };
      } catch (error) { return { success: false, error }; }
    }
    return { success: false, error: 'No user found' };
  },

  // --- 2. LOGIC LẤY PROFILE  ---
  fetchUserProfile: async (uid) => {
    const user = auth.currentUser;

    if (user && user.isAnonymous) {
      try {
        const storedData = await AsyncStorage.getItem(GUEST_DATA_KEY);
        if (storedData) {
          set({ userProfile: JSON.parse(storedData), isLoading: false });
        } else {
          const defaultData = getDefaultUserData("Khách ghé thăm");
          await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(defaultData));
          set({ userProfile: defaultData, isLoading: false });
        }
      } catch (e) { set({ isLoading: false }); }
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const serverData = docSnap.data();
        const defaultData = getDefaultUserData();
        const mergedData = {
            ...defaultData,
            ...serverData,
            stats: { ...defaultData.stats, ...(serverData.stats || {}) },
            quizResults: serverData.quizResults || {},
            notificationSettings: serverData.notificationSettings || defaultData.notificationSettings
        };
        set({ userProfile: mergedData, isLoading: false });
      } else {
        const defaultData = getDefaultUserData(auth.currentUser?.email?.split('@')[0]);
        await setDoc(docRef, defaultData);
        set({ userProfile: defaultData, isLoading: false });
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      set({ isLoading: false });
    }
  },

  // --- 3. LOGIC CỘNG ĐIỂM ---
  addPointsToUser: async (pointsToAdd) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "User not authenticated" };

    const currentProfile = get().userProfile;
    const currentPoints = currentProfile?.stats?.points || 0;
    const currentHighScore = currentProfile?.stats?.highScore || 0;
    
    const newPoints = Math.max(0, currentPoints + pointsToAdd);
    const newHighScore = Math.max(currentHighScore, newPoints);

    const newProfileState = {
      ...currentProfile,
      stats: {
        ...currentProfile.stats,
        points: newPoints,
        highScore: newHighScore
      }
    };
    set({ userProfile: newProfileState });

    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfileState));
        return { success: true, newPoints, newHighScore };
      } catch (e) { return { success: false, error: e.message }; }
    }

    try {
        const docRef = doc(db, "users", user.uid);
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(docRef);
            const data = userSnap.data();
            const svPoints = data?.stats?.points || 0;
            const svHighScore = data?.stats?.highScore || 0;

            const finalPoints = Math.max(0, svPoints + pointsToAdd);
            const finalHighScore = Math.max(svHighScore, finalPoints);

            transaction.update(docRef, {
                "stats.points": finalPoints, 
                "stats.highScore": finalHighScore
            });
        });
        return { success: true, newPoints, newHighScore };
    } catch (error) {
        console.error("Lỗi transaction điểm:", error);
        set({ userProfile: currentProfile });
        return { success: false, error: error.message };
    }
  },

  recordQuizResult: async (quizId, currentCorrectCount, pointsPerQuestion) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "User not authenticated" };

    if (user.isAnonymous) {
        const pointsToAward = currentCorrectCount * pointsPerQuestion; 
        await get().addPointsToUser(pointsToAward);
        return { success: true, pointsAwarded: pointsToAward };
    }

    const docRef = doc(db, "users", user.uid);
    let pointsToAward = 0;

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(docRef);
            const data = userSnap.data();
            const results = data?.quizResults || {};
            const previousBestCorrect = results[quizId]?.correctCount || 0;
            
            if (currentCorrectCount > previousBestCorrect) {
                const newCorrectAnswers = currentCorrectCount - previousBestCorrect;
                pointsToAward = newCorrectAnswers * pointsPerQuestion;
                
                const currentPoints = data?.stats?.points || 0;
                const currentHighScore = data?.stats?.highScore || 0;
                
                const newPointsTotal = currentPoints + pointsToAward;
                const newHighScoreTotal = Math.max(currentHighScore, newPointsTotal);

                transaction.update(docRef, {
                    "stats.points": newPointsTotal,
                    "stats.highScore": newHighScoreTotal,
                    [`quizResults.${quizId}`]: {
                        correctCount: currentCorrectCount, 
                        pointsEarned: (results[quizId]?.pointsEarned || 0) + pointsToAward 
                    }
                });

                // Cập nhật UI State
                const newProfile = { ...get().userProfile };
                newProfile.stats.points = newPointsTotal;
                newProfile.stats.highScore = newHighScoreTotal;
                if(!newProfile.quizResults) newProfile.quizResults = {};
                newProfile.quizResults[quizId] = {
                    correctCount: currentCorrectCount,
                    pointsEarned: (results[quizId]?.pointsEarned || 0) + pointsToAward
                };
                set({ userProfile: newProfile });
            }
        });
        return { success: true, pointsAwarded: pointsToAward }; 
    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  // --- 5. ĐỔI QUÀ ---
  exchangePointsForReward: async (rewardCost) => {
    return await get().addPointsToUser(-rewardCost); // Tái sử dụng hàm addPointsToUser (đã hỗ trợ âm)
  },

  // --- 6. CẬP NHẬT PROFILE & SETTINGS ---
  updateUserProfile: async (data) => {
    const user = auth.currentUser;
    if (!user) return { success: false };

    const newProfile = { ...get().userProfile, ...data };
    set({ userProfile: newProfile });

    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
        return { success: true };
      } catch (e) { return { success: false, error: e }; }
    }

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },
  
  // Update Settings (Wrapper)
  updateUserSettings: async (settingsData) => {
    return await get().updateUserProfile(settingsData);
  },

  // --- 7. CÁC HÀM KHÁC (UPLOAD, LOGIN...) ---
  uploadAvatar: async (uri) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !uri) return { success: false, error: "No user or URI" };
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
      } else { return { success: false, error: "Upload failed" }; }
    } catch (error) { return { success: false, error }; }
  },

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },

  loginGuest: async () => {
    try {
      await signInAnonymously(auth);
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },

  changeUserPassword: async (newPassword) => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return { success: false, error: "Not allowed for guest" };
    try {
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },

  loginWithGoogle: async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return { success: true, user: result.user };
    } catch (error) { return { success: false, error }; }
  },

  // --- 8. RESET & DELETE ---
  resetUserData: async () => {
    const user = auth.currentUser;
    if (!user) return { success: false };
    const resetData = getDefaultUserData(get().userProfile.displayName);
    set({ userProfile: resetData });

    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(resetData));
        return { success: true };
      } catch (e) { return { success: false, error: e }; }
    }

    try {
      await setDoc(doc(db, "users", user.uid), resetData);
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },

  deleteUserAccount: async () => {
    const user = auth.currentUser;
    if (!user) return { success: false };
    try {
      if (user.isAnonymous) {
        await AsyncStorage.removeItem(GUEST_DATA_KEY);
      } else {
        const uid = user.uid;
        await deleteDoc(doc(db, "users", uid));
      }
      await deleteUser(user);
      set({ user: null, userProfile: null });
      return { success: true };
    } catch (error) { return { success: false, error }; }
  },

  // --- 9. DATA HELPERS (READ-ONLY) ---
  getRealtimeAQI: async () => {
    try {
      const q = query(collection(db, "aqi_data"), orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data().aqi || 0;
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

  // --- 10. HISTORY & REPORT ---
  addReportToHistory: async (reportData) => {
    const user = auth.currentUser;
    const currentProfile = get().userProfile;
    if (!currentProfile) return;

    const newReport = {
      id: Date.now().toString(),
      time: new Date().toLocaleDateString('vi-VN'),
      status: 'pending',
      ...reportData
    };

    const newHistory = [newReport, ...(currentProfile.reportHistory || [])];
    const newStats = {
      ...currentProfile.stats,
      sentReports: (currentProfile.stats?.sentReports || 0) + 1
    };
    const newProfile = { ...currentProfile, reportHistory: newHistory, stats: newStats };
    set({ userProfile: newProfile });

    if (user.isAnonymous) {
      await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfile));
    } else {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        reportHistory: arrayUnion(newReport),
        "stats.sentReports": increment(1)
      });
    }
    return { success: true };
  },

  addChatToHistory: async (messages) => {
    const user = auth.currentUser;
    const currentProfile = get().userProfile;
    if (!currentProfile || !messages.length) return;

    const newChat = {
      id: Date.now().toString(),
      time: new Date().toLocaleDateString('vi-VN'),
      name: messages.find(m => m.sender === 'user')?.text || "Đoạn chat mới",
      messages: messages
    };

    const newHistory = [newChat, ...(currentProfile.chatHistory || [])];
    set({ userProfile: { ...currentProfile, chatHistory: newHistory } });

    if (user.isAnonymous) {
      await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ ...currentProfile, chatHistory: newHistory }));
    } else {
      await updateDoc(doc(db, "users", user.uid), { chatHistory: arrayUnion(newChat) });
    }
    return { success: true };
  },

  // --- 11. NOTIFICATION TRIGGER ---
  triggerDynamicNotification: async (type) => {
    const { userProfile, getRealtimeAQI, getLatestCampaign, countActiveEvents, getTrashSchedule } = get();
    const userThreshold = parseInt(userProfile?.aqiSettings?.threshold || "150");
    let content = null;

    switch (type) {
      case 'weather':
        const currentAQI = await getRealtimeAQI();
        if (currentAQI > userThreshold) {
          content = { title: `⚠️ Cảnh báo AQI: ${currentAQI}`, body: `Vượt ngưỡng an toàn (${userThreshold}).`, data: { screen: 'AqiDetail' } };
        } else {
          content = { title: `✅ Không khí ổn định`, body: `AQI hiện tại là ${currentAQI}.`, data: { screen: 'AqiDetail' } };
        }
        break;
      case 'trash':
        const schedule = await getTrashSchedule();
        if (schedule) content = { title: `🚛 Lịch thu gom: ${schedule.type}`, body: `Xe đến lúc ${schedule.time}.`, data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } } };
        else content = { title: "🚛 Nhắc nhở rác", body: "Kiểm tra lịch thu gom hôm nay.", data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } } };
        break;
      case 'campaign':
        const campaign = await getLatestCampaign();
        if (campaign) content = { title: `🌱 Chiến dịch: ${campaign.name}`, body: `Tham gia nhận ${campaign.reward} điểm!`, data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } } };
        else content = { title: "🌱 EcoMate", body: "Chưa có chiến dịch mới.", data: { screen: 'MainTabs', params: { screen: 'Trang chủ' } } };
        break;
      case 'community':
        const eventCount = await countActiveEvents();
        if (eventCount > 0) content = { title: `🔥 Cộng đồng`, body: `Có ${eventCount} sự kiện sắp tới.`, data: { screen: 'MainTabs', params: { screen: 'Cộng đồng' } } };
        else content = { title: "🔥 Cộng đồng", body: "Tạo bài viết mới ngay!", data: { screen: 'MainTabs', params: { screen: 'Đăng tin' } } };
        break;
    }

    if (content) {
      await Notifications.scheduleNotificationAsync({
        content: { title: content.title, body: content.body, sound: true, data: content.data || {} },
        trigger: null,
      });
    }
  },
  confirmTrashSorted: async (pointsReward = 5) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: "User not authenticated" };

    const docRef = doc(db, "users", uid);

    try {
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(docRef);
        if (!userSnap.exists()) throw "User does not exist!";

        const data = userSnap.data();
        const currentStats = data.stats || {};

        // 1. Cộng điểm
        const newPoints = (currentStats.points || 0) + pointsReward;
        const newHighScore = Math.max((currentStats.highScore || 0), newPoints);
        
        // 2. Tăng số lần phân loại rác (trashSorted)
        const newTrashSorted = (currentStats.trashSorted || 0) + 1;

        transaction.update(docRef, {
          "stats.points": newPoints,
          "stats.highScore": newHighScore,
          "stats.trashSorted": newTrashSorted // <-- Quan trọng: Update cái này
        });

        // Cập nhật State Local để UI Profile nhảy số ngay lập tức
        const currentProfile = get().userProfile;
        set({
           userProfile: {
             ...currentProfile,
             stats: {
               ...currentProfile.stats,
               points: newPoints,
               highScore: newHighScore,
               trashSorted: newTrashSorted
             }
           }
        });
      });

      return { success: true, points: pointsReward };
    } catch (error) {
      console.error("Lỗi confirm trash:", error);
      return { success: false, error: error.message };
    }
  },
}));

