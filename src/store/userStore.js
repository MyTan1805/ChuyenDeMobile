// src/store/userStore.js

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
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
  signInWithCredential,
  updateProfile
} from 'firebase/auth';

import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, increment,
  arrayUnion, runTransaction, writeBatch, addDoc,
} from 'firebase/firestore';

import { encrypt, decrypt } from '../utils/encryption';

const CLOUD_NAME = "dqpyrygyu";
const UPLOAD_PRESET = "ecoapp_preset";
const GUEST_DATA_KEY = "guest_user_data";

// --- Helper: Tạo dữ liệu mặc định ---
const getDefaultUserData = (displayName) => ({
  displayName: displayName || "Người dùng",
  location: "Chưa cập nhật",
  phoneNumber: "",
  photoURL: null,
  isLocationShared: false,
  aqiSettings: { isEnabled: true, threshold: "150" },
  notificationSettings: { weather: false, trash: false, campaign: false, community: false },
  createdAt: new Date().toISOString(),
  notifications: [],
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

  register: async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (name) await updateProfile(user, { displayName: name });
      const defaultData = getDefaultUserData(name);
      await setDoc(doc(db, "users", user.uid), defaultData);
      set({ userProfile: defaultData });
      return { success: true, user: user };
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

  // --- 2. LOGIC LẤY PROFILE (ĐÃ SỬA: GIẢI MÃ DỮ LIỆU) ---
  fetchUserProfile: async (uid) => {
    const user = auth.currentUser;
    if (user && user.isAnonymous) {
      try {
        const storedData = await AsyncStorage.getItem(GUEST_DATA_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.phoneNumber) parsedData.phoneNumber = decrypt(parsedData.phoneNumber);
          if (parsedData.location) parsedData.location = decrypt(parsedData.location);
          set({ userProfile: parsedData, isLoading: false });
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
        if (serverData.phoneNumber) serverData.phoneNumber = decrypt(serverData.phoneNumber);
        if (serverData.location) serverData.location = decrypt(serverData.location);

        const defaultData = getDefaultUserData();
        const mergedData = { ...defaultData, ...serverData };
        set({ userProfile: mergedData, isLoading: false });
      } else {
        const defaultData = getDefaultUserData(auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0]);
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

    const newProfileState = { ...currentProfile, stats: { ...currentProfile.stats, points: newPoints, highScore: newHighScore } };
    set({ userProfile: newProfileState });

    if (user.isAnonymous) {
      try {
        await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(newProfileState));
        return { success: true, newPoints, newHighScore };
      } catch (e) { return { success: false, error: e.message }; }
    }

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        "stats.points": newPoints,
        "stats.highScore": newHighScore
      });
      return { success: true, newPoints, newHighScore };
    } catch (error) { return { success: false, error: error.message }; }
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
          if (!newProfile.quizResults) newProfile.quizResults = {};
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

  exchangePointsForReward: async (rewardCost) => {
    return await get().addPointsToUser(-rewardCost);
  },

  // --- 4. CẬP NHẬT PROFILE (ĐÃ SỬA: MÃ HÓA DỮ LIỆU) ---
  updateUserProfile: async (data) => {
    const user = auth.currentUser;
    if (!user) return { success: false };

    // Cập nhật state local ngay lập tức để UI mượt
    const newProfile = { ...get().userProfile, ...data };
    set({ userProfile: newProfile });

    // Mã hóa dữ liệu nhạy cảm trước khi lưu
    const dataToSave = { ...data };
    if (dataToSave.phoneNumber) dataToSave.phoneNumber = encrypt(dataToSave.phoneNumber);
    if (dataToSave.location) dataToSave.location = encrypt(dataToSave.location);

    // Trường hợp là khách (Guest)
    if (user.isAnonymous) {
      const profileToStore = { ...newProfile, ...dataToSave };
      await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(profileToStore));
      return { success: true };
    }

    try {
      const batch = writeBatch(db); // Khởi tạo Batch

      // 1. Cập nhật bảng 'users'
      const userRef = doc(db, "users", user.uid);
      batch.update(userRef, dataToSave);

      // 2. Nếu có thay đổi ảnh đại diện hoặc tên, cập nhật luôn các bài viết cũ (community_posts)
      if (data.photoURL || data.displayName) {
        console.log("🔄 Đang đồng bộ thông tin sang các bài viết cũ...");

        const postsRef = collection(db, "community_posts");
        // Tìm tất cả bài viết của user này
        const q = query(postsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const updateObj = {};
          if (data.photoURL) updateObj.userAvatar = data.photoURL;
          if (data.displayName) updateObj.userName = data.displayName;

          batch.update(doc.ref, updateObj);
        });
      }

      // 3. Thực thi tất cả lệnh cập nhật cùng lúc
      await batch.commit();
      console.log("✅ Đã cập nhật profile và đồng bộ bài viết.");

      return { success: true };
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      return { success: false, error };
    }
  },

  updateUserSettings: async (settingsData) => {
    return await get().updateUserProfile(settingsData);
  },

  // --- UPLOAD ĐA NĂNG (MỚI - ĐÃ FIX TIMEOUT & SIZE) ---
  uploadMedia: async (uri, type = 'image') => {
    if (!uri) return { success: false, error: "No URI" };
    try {
      // 1. Check file size
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && fileInfo.size > 10 * 1024 * 1024) return { success: false, error: "File quá lớn (>10MB)" };

      // 2. Prepare FormData correctly
      const formData = new FormData();
      const uriParts = uri.split('.');
      let fileType = uriParts[uriParts.length - 1];
      if (fileType === 'jpeg') fileType = 'jpg';

      const mimeType = type === 'video' ? `video/mp4` : `image/jpeg`;
      const fileName = `upload_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`;

      // Quan trọng: Cloudinary cần resource_type đúng trong URL
      const resourceType = type === 'video' ? 'video' : 'image';

      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName
      });
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      // 3. Upload with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);
      if (!data.secure_url) throw new Error("Không nhận được link ảnh");

      return { success: true, url: data.secure_url, type: resourceType };
    } catch (error) {
      console.error("Upload failed:", error);
      return { success: false, error: error.message || "Lỗi upload" };
    }
  },

  // Giữ lại uploadAvatar cũ (có thể dùng uploadMedia thay thế sau này)
  uploadAvatar: async (uri) => {
    return await get().uploadMedia(uri, 'image');
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
      
      if (result.user) {
        return { success: true, user: result.user };
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      return { success: false, error };
    }
  },

  loginWithGoogleDirect: async (googleUser) => {
    set({ isLoading: true });
    try {
      console.log("🚀 Bắt đầu xử lý login tà đạo:", googleUser.email);

      // 1. Dùng email làm ID document trong Firestore (cho dễ tìm)
      const userRef = doc(db, "users", googleUser.email);
      const docSnap = await getDoc(userRef);

      let profileData;

      if (docSnap.exists()) {
        // User cũ: Lấy data về
        profileData = docSnap.data();
        console.log("✅ User cũ đã quay lại:", profileData.displayName);
      } else {
        // User mới: Tạo data mặc định + Info Google
        profileData = getDefaultUserData(googleUser.name);
        profileData.email = googleUser.email;
        profileData.photoURL = googleUser.picture;
        profileData.ggId = googleUser.id; // Lưu ID Google để tham chiếu sau này
        
        await setDoc(userRef, profileData);
        console.log("🎉 User mới đã được tạo!");
      }

      // 2. Lưu Session vào máy (để F5 app vẫn còn đăng nhập)
      // Lưu ý: Ta lưu object này vào user state để App coi như đã login
      const sessionUser = {
        uid: googleUser.email, // Hack: Dùng email làm UID giả
        email: googleUser.email,
        displayName: googleUser.name,
        photoURL: googleUser.picture,
        isAnonymous: false,
        providerData: [{ providerId: 'google.com' }] 
      };

      await AsyncStorage.setItem("user_session_direct", JSON.stringify(sessionUser));

      // 3. Cập nhật State -> App tự chuyển màn hình
      set({ 
        user: sessionUser, 
        userProfile: profileData, 
        isLoading: false 
      });

      return { success: true };

    } catch (error) {
      console.error("❌ Lỗi login tà đạo:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

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
        const batch = writeBatch(db);

        // 1. Xóa bài viết (community_posts)
        const postsQ = query(collection(db, "community_posts"), where("userId", "==", uid));
        const postsSnap = await getDocs(postsQ);
        postsSnap.forEach((doc) => batch.delete(doc.ref));

        // 2. Xóa báo cáo (reports)
        const reportsQ = query(collection(db, "reports"), where("userId", "==", uid));
        const reportsSnap = await getDocs(reportsQ);
        reportsSnap.forEach((doc) => batch.delete(doc.ref));

        // 3. Xóa User Profile
        const userRef = doc(db, "users", uid);
        batch.delete(userRef);

        await batch.commit();
      }

      await deleteUser(user);
      set({ user: null, userProfile: null });
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  },

  // --- Helpers ---
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

  // --- HISTORY & REPORT ---
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

    // Giới hạn chỉ giữ 20 đoạn chat gần nhất
    let newHistory = [newChat, ...(currentProfile.chatHistory || [])];
    if (newHistory.length > 20) newHistory = newHistory.slice(0, 20);

    set({ userProfile: { ...currentProfile, chatHistory: newHistory } });

    if (user.isAnonymous) {
      await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ ...currentProfile, chatHistory: newHistory }));
    } else {
      await updateDoc(doc(db, "users", user.uid), { chatHistory: newHistory }); // Lưu đè mảng mới đã cắt
    }
    return { success: true };
  },

  deleteChatSession: async (chatId) => {
    const user = auth.currentUser;
    const currentProfile = get().userProfile;
    if (!currentProfile) return;

    const newHistory = currentProfile.chatHistory.filter(c => c.id !== chatId);
    set({ userProfile: { ...currentProfile, chatHistory: newHistory } });

    if (user.isAnonymous) {
      await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ ...currentProfile, chatHistory: newHistory }));
    } else {
      await updateDoc(doc(db, "users", user.uid), { chatHistory: newHistory });
    }
    return { success: true };
  },

  deleteReport: async (reportId) => {
    const user = auth.currentUser;
    const currentProfile = get().userProfile;
    if (!currentProfile) return;

    const newHistory = currentProfile.reportHistory.filter(r => r.id !== reportId);
    set({ userProfile: { ...currentProfile, reportHistory: newHistory } });

    if (user.isAnonymous) {
      await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ ...currentProfile, reportHistory: newHistory }));
    } else {
      await updateDoc(doc(db, "users", user.uid), { reportHistory: newHistory });
    }
    return { success: true };
  },

  // --- NOTIFICATION ---
  addNotificationToHistory: async (notiData) => {
    const user = auth.currentUser;
    if (!user) return;

    const newNoti = {
      userId: user.uid, // Quan trọng để query lại
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notiData
    };

    // Cập nhật UI tạm thời
    const currentProfile = get().userProfile;
    // (Optional: Bạn có thể bỏ qua bước update local này nếu muốn load lại từ server)
    
    try {
        // LƯU VÀO COLLECTION RIÊNG 'notifications' (Khớp ảnh 2)
        const docRef = await addDoc(collection(db, "notifications"), newNoti);
        console.log("✅ Đã lưu thông báo vào Firestore:", newNoti.title);

        // Cập nhật state local ngay lập tức để UI phản hồi nhanh
        const updatedProfile = { ...currentProfile };
        updatedProfile.notifications = [ { id: docRef.id, ...newNoti }, ...(updatedProfile.notifications || []) ];
        set({ userProfile: updatedProfile });

        // Nếu là user khách (anonymous), lưu vào AsyncStorage để khôi phục sau
        if (user.isAnonymous) {
          try {
            await AsyncStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updatedProfile));
          } catch (e) { /* ignore */ }
        }
    } catch (e) {
        console.log("Lỗi lưu thông báo:", e);
    }
  },
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
      await get().addNotificationToHistory({
          type: type,
          title: content.title,
          body: content.body,
          data: content.data
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

export const userStore = useUserStore;