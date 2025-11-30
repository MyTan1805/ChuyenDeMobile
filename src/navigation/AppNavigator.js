import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
// 1. Thêm import getStateFromPath ở đây
import { NavigationContainer, getStateFromPath } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';

// ----- IMPORT CÁC MÀN HÌNH SETTING -----
import SettingsScreen from '@/features/settings/screens/SettingsScreen';
import AccountManagementScreen from '@/features/settings/screens/AccountManagementScreen';
import ChangePasswordScreen from '@/features/settings/screens/ChangePasswordScreen';
import NotificationSettingsScreen from '@/features/settings/screens/NotificationSettingsScreen';
import AQISettingsScreen from '@/features/settings/screens/AQISettingsScreen';
import PrivacyLocationScreen from '@/features/settings/screens/PrivacyLocationScreen';
import ReportHistoryScreen from '@/features/settings/screens/ReportHistoryScreen';
import ChatbotHistoryScreen from '@/features/settings/screens/ChatbotHistoryScreen';
import AboutScreen from '@/features/settings/screens/AboutScreen';
import TermsScreen from '@/features/settings/screens/TermsScreen';
import PrivacyScreen from '@/features/settings/screens/PrivacyScreen';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';
import { useNotifications } from '@/hooks/useNotifications';

// ==================== IMPORT MÀN HÌNH ====================
// 1. AUTH 
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';
import VerifyEmailScreen from '@/features/auth/screens/VerifyEmailScreen';

// 2. AQI & HOME 
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import AqiDetailScreen from '@/features/aqi/screens/AqiDetailScreen';
import ChatbotScreen from '@/features/chatbot/screens/ChatbotScreen';

// 3. COMMUNITY & WASTE GUIDE (Của Tân & Tiền)
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import WasteClassificationScreen from '@/features/community/screens/WasteClassificationScreen';
import WasteDetailScreen from '@/features/community/screens/WasteDetailScreen';
import PostScreen from '@/features/community/screens/PostScreen';
import EcoLibraryScreen from '@/features/community/screens/EcoLibraryScreen';
import ArticleDetailScreen from '@/features/community/screens/ArticleDetailScreen';
import QuizScreen from '@/features/community/screens/QuizScreen';
import QuizCollectionScreen from '@/features/community/screens/QuizCollectionScreen';
import PostDetailScreen from '@/features/community/screens/PostDetailScreen';
import CreateGroupScreen from '@/features/community/screens/CreateGroupScreen';
import RecycleDIYScreen from '@/features/community/screens/RecycleDIYScreen';
import GroupDetailScreen from '@/features/community/screens/GroupDetailScreen';
import EditGroupScreen from '@/features/community/screens/EditGroupScreen';
import WasteSearchScreen from '@/features/waste-guide/screens/WasteSearchScreen'; // Đã sửa import đúng

// 4. GAMIFICATION & PROFILE
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';
import BadgeCollectionScreen from '@/features/gamification/screens/BadgeCollectionScreen';

// 5. NOTIFICATION
import NotificationListScreen from '@/features/notifications/screens/NotificationListScreen';

// 6. REPORT & MAP (Của Bảo)
import CreateReportScreen from '@/features/reports/screens/CreateReportScreen';
import ReportDetailScreen from '@/features/reports/screens/ReportDetailScreen';
import EnvironmentalMapScreen from '@/features/map/screens/EnvironmentalMapScreen';
import AnalyticsScreen from '@/features/analytics/screens/AnalyticsScreen'; // Nếu có folder analytics

// 7. ADMIN (Của Bảo)
import AdminNavigator from '@/navigation/AdminNavigator'; // Đảm bảo file này tồn tại

// ----- COMPONENT -----
import CustomTabBar from '@/components/CustomTabBar';

// ==================== KHỞI TẠO ====================
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const CommunityStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const MainStack = createStackNavigator();
const VerifyStack = createStackNavigator();

// --- CẤU HÌNH DEEP LINKING ---
const prefix = Linking.createURL('/');
const linking = {
  prefixes: [prefix, 'ecomate://', 'https://ecoapp-dc865.firebaseapp.com'],
  config: {
    screens: {
      AuthFlow: {
        screens: {
          VerifyEmail: { path: 'verify-email', parse: { oobCode: (c) => c, mode: (m) => m } },
        },
      },
      MainStack: {
        screens: {
          PostDetail: {
            path: 'post/:postId',
            parse: { postId: (id) => id },
          },
          ArticleDetail: {
            path: 'article/:articleId',
            parse: { articleId: (id) => id },
          },
          WasteDetail: {
            path: 'waste/:wasteId',
            parse: { wasteId: (id) => id },
          },
          AqiDetail: 'aqi',
        }
      },
      VerifyEmailCheck: { path: 'verify-email-check', parse: { oobCode: (oobCode) => oobCode, mode: (mode) => mode } }
    },
  },
  // 2. Sửa hàm getStateFromPath
  getStateFromPath: (path, config) => {
    const url = Linking.parse(path);

    // Xử lý logic custom cho email verification
    if (url.queryParams?.mode === 'verifyEmail') {
      return {
        routes: [{
          name: 'VerifyEmailCheck',
          params: {
            oobCode: url.queryParams.oobCode,
            type: 'emailVerification'
          }
        }]
      };
    }

    // Sử dụng hàm getStateFromPath được import từ @react-navigation/native làm mặc định
    return getStateFromPath(path, config);
  },
};

// --- AUTH ---
function AuthFlowGroup() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </AuthStack.Navigator>
  )
}
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthFlow" component={AuthFlowGroup} />
    </AuthStack.Navigator>
  );
}

// --- HOME STACK ---
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AqiDashboard" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

// --- COMMUNITY STACK ---
function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="CommunityMain" component={CommunityScreen} />
      <CommunityStack.Screen name="WasteClassification" component={WasteClassificationScreen} />
      <CommunityStack.Screen name="EcoLibrary" component={EcoLibraryScreen} />
      {/* <CommunityStack.Screen name="ArticleDetail" component={ArticleDetailScreen} /> */}
      <CommunityStack.Screen name="QuizCollection" component={QuizCollectionScreen} />
      <CommunityStack.Screen name="Quiz" component={QuizScreen} />
    </CommunityStack.Navigator>
  );
}

// --- VERIFY ---
function VerifyNavigator() {
  return (
    <VerifyStack.Navigator screenOptions={{ headerShown: false }}>
      <VerifyStack.Screen name="VerifyEmailCheck" component={VerifyEmailScreen} initialParams={{ type: 'emailVerification' }} />
    </VerifyStack.Navigator>
  )
}

// --- TAB NAVIGATOR ---
function MainTabNavigator() {
  return (
    <MainTab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <MainTab.Screen name="Trang chủ" component={HomeStackNavigator} />
      <MainTab.Screen name="Cộng đồng" component={CommunityStackNavigator} />
      <MainTab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: true, headerTitle: "Đăng bài viết" }} />
      <MainTab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: true, headerTitle: "Cửa hàng xanh" }} />
      <MainTab.Screen name="Hồ sơ" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

// --- ROOT MAIN NAVIGATOR (MERGE ALL) ---
function MainNavigator() {
  useNotifications(); // Kích hoạt nhận thông báo

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
      
      <MainStack.Screen name="Chatbot" component={ChatbotScreen} />
      <MainStack.Screen name="Notifications" component={NotificationListScreen} /> 
      <MainStack.Screen name="AqiDetail" component={AqiDetailScreen} />

      <MainStack.Screen name="WasteClassification" component={WasteClassificationScreen} />
      <MainStack.Screen name="WasteSearch" component={WasteSearchScreen} />

      <MainStack.Screen name="PostDetail" component={PostDetailScreen} />
      {/* <MainStack.Screen name="ArticleDetail" component={ArticleDetailScreen} /> */}
      <MainStack.Screen name="WasteDetail" component={WasteDetailScreen} />
      <MainStack.Screen name="RecycleDIY" component={RecycleDIYScreen} />

      {/* === NHÓM COMMUNITY (VY & TIỀN) === */}
      <MainStack.Screen name="EcoLibrary" component={EcoLibraryScreen} /> 
      <CommunityStack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <MainStack.Screen name="QuizCollection" component={QuizCollectionScreen} />
      <MainStack.Screen name="Quiz" component={QuizScreen} />
      <MainStack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <MainStack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <MainStack.Screen name="EditGroup" component={EditGroupScreen} />

      {/* === NHÓM REPORT & MAP (BẢO) === */}
      <MainStack.Screen name="CreateReport" component={CreateReportScreen} />
      <MainStack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <MainStack.Screen name="EnvironmentalMap" component={EnvironmentalMapScreen} />
      <MainStack.Screen name="Analytics" component={AnalyticsScreen} />
      <MainStack.Screen name="AdminPortal" component={AdminNavigator} />

      {/* === NHÓM PROFILE & SETTINGS === */}
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="BadgeCollection" component={BadgeCollectionScreen} /> 
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="AccountManagement" component={AccountManagementScreen} />
      <MainStack.Screen name="ChangePasswordSettings" component={ChangePasswordScreen} />
      <MainStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <MainStack.Screen name="AQISettings" component={AQISettingsScreen} />
      <MainStack.Screen name="PrivacyLocation" component={PrivacyLocationScreen} />
      <MainStack.Screen name="ReportHistory" component={ReportHistoryScreen} />
      <MainStack.Screen name="ChatbotHistory" component={ChatbotHistoryScreen} />
      <MainStack.Screen name="AboutApp" component={AboutScreen} />
      <MainStack.Screen name="TermsOfService" component={TermsScreen} />
      <MainStack.Screen name="PrivacyPolicy" component={PrivacyScreen} />

      {/* Cấu hình Modal cho Đăng tin */}
      <MainStack.Screen
        name="Đăng tin"
        component={PostScreen}
        options={{
          presentation: 'modal',

          gestureEnabled: true,

          // 3. (Tuỳ chọn) Nếu muốn hiệu ứng trong suốt mờ nền phía sau giống iOS 13+
          // cardStyle: { backgroundColor: 'transparent' }, 

          headerShown: false
        }}
      />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  // ✅ FIX INFINITE LOOP
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const checkAuthState = useUserStore((state) => state.checkAuthState);

  useEffect(() => {
    const unsubscribe = checkAuthState();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []); 

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2F847C" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator size="large" />}>
      {!user ? <AuthNavigator /> : (user.emailVerified || user.isAnonymous) ? <MainNavigator /> : <VerifyNavigator />}
    </NavigationContainer>
  );
}