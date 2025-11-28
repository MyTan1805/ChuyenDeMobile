import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

// 3. COMMUNITY 
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import WasteClassificationScreen from '@/features/community/screens/WasteClassificationScreen';
import WasteDetailScreen from '@/features/community/screens/WasteDetailScreen';
import PostScreen from '@/features/community/screens/PostScreen';
import EcoLibraryScreen from '@/features/community/screens/EcoLibraryScreen';
import ArticleDetailScreen from '@/features/community/screens/ArticleDetailScreen';
import QuizScreen from '@/features/community/screens/QuizScreen';
import QuizCollectionScreen from '@/features/community/screens/QuizCollectionScreen';

// 4. GAMIFICATION & PROFILE
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';

import NotificationListScreen from '@/features/notifications/screens/NotificationListScreen';
import WasteSearchScreen from '@/features/waste-guide/screens/WasteSearchScreen';
// 5. REPORT
import CreateReportScreen from '@/features/reports/screens/CreateReportScreen';


// ----- COMPONENT -----
import CustomTabBar from '@/components/CustomTabBar'; 

// ==================== KHỞI TẠO ====================
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();       
const CommunityStack = createStackNavigator();     

// ==================== 1. AUTH NAVIGATOR ====================
const MainTab = createBottomTabNavigator();
const MainStack = createStackNavigator();
const VerifyStack = createStackNavigator();

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [
    prefix,
    'ecomate://',
    'https://ecoapp-dc865.firebaseapp.com',
  ],
  config: {
    screens: {
      // Cấu hình Deep Link
      AuthFlow: {
        screens: {
          VerifyEmail: {
            path: 'verify-email',
            parse: {
              oobCode: (oobCode) => oobCode,
              mode: (mode) => mode,
            },
          },
        },
      },
      VerifyEmailCheck: {
        path: 'verify-email-check',
        parse: {
          oobCode: (oobCode) => oobCode,
          mode: (mode) => mode,
        },
      }
    },
  },
  getStateFromPath: (path, options) => {
    const url = Linking.parse(path);
    if (url.queryParams?.mode) {
      const { mode, oobCode } = url.queryParams;
      if (mode === 'verifyEmail') {
        return {
          routes: [
            {
              name: 'VerifyEmailCheck',
              params: { oobCode, type: 'emailVerification' }
            },
          ],
        };
      }
    }
    return options.getStateFromPath(path, options);
  },
};

// 1. NAVIGATOR XÁC THỰC (Chưa login)
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthFlow" component={AuthFlowGroup} />
    </AuthStack.Navigator>
  );
}

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

// ==================== 2. HOME STACK ====================
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AqiDashboard" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

// ==================== 3. COMMUNITY STACK ====================
function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="CommunityMain" component={CommunityScreen} />
      <CommunityStack.Screen name="WasteClassification" component={WasteClassificationScreen} />
      <CommunityStack.Screen name="EcoLibrary" component={EcoLibraryScreen} /> 
      <CommunityStack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <CommunityStack.Screen name="QuizCollection" component={QuizCollectionScreen} /> 
      <CommunityStack.Screen name="Quiz" component={QuizScreen} />
    </CommunityStack.Navigator>
  );
}

// ==================== 4. MAIN TAB NAVIGATOR ====================
// ... (Giữ nguyên MainTabNavigator, MainNavigator, AppNavigator như cũ)
// Chỉ cần đảm bảo bỏ NewPasswordScreen ở import và AuthNavigator
// 2. NAVIGATOR XÁC NHẬN EMAIL (Đã login nhưng chưa xác thực và KHÔNG phải khách)
function VerifyNavigator() {
  return (
    <VerifyStack.Navigator screenOptions={{ headerShown: false }}>
      <VerifyStack.Screen
        name="VerifyEmailCheck"
        component={VerifyEmailScreen}
        initialParams={{ type: 'emailVerification' }}
      />
    </VerifyStack.Navigator>
  )
}

// 3. NAVIGATOR CHÍNH (Tab Bar)
function MainTabNavigator() {
  return (
    <MainTab.Navigator 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <MainTab.Screen name="Trang chủ" component={HomeStackNavigator} />
      <MainTab.Screen name="Cộng đồng" component={CommunityStackNavigator} />
      <MainTab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: true, headerTitle: "Đăng bài viết" }} />
      <MainTab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: true, headerTitle: "Cửa hàng xanh" }} />
      <MainTab.Screen name="Hồ sơ" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

// ==================== 5. MAIN NAVIGATOR (ROOT STACK) ====================
function MainNavigator() {

  useNotifications();
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
      <MainStack.Screen name="Chatbot" component={ChatbotScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />

      <MainStack.Screen name="AqiDetail" component={AqiDetailScreen} />
      <MainStack.Screen name="Notifications" component={NotificationListScreen} /> 
      
      <MainStack.Screen name="WasteSearch" component={WasteSearchScreen} />
      <MainStack.Screen name="WasteDetail" component={WasteDetailScreen} />

      <MainStack.Screen name="CreateReport" component={CreateReportScreen} />

      {/* Nhóm Setting */}
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
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading, checkAuthState } = useUserStore((state) => state);
  
  useEffect(() => {
    const unsubscribe = checkAuthState();
    return () => unsubscribe(); 
  }, [checkAuthState]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2F847C" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator size="large" />}>
      {
        !user ? (
          // Case 1: Chưa đăng nhập -> Hiện Auth
          <AuthNavigator />
        ) : (user.emailVerified || user.isAnonymous) ? (
          // Case 2: (Đã xác thực) HOẶC (Là khách) -> Vào Main
          // Đây là chỗ sửa quan trọng nhất: thêm user.isAnonymous
          <MainNavigator />
        ) : (
          // Case 3: Đã đăng nhập, chưa xác thực, KHÔNG phải khách -> Bắt xác thực
          <VerifyNavigator />
        )
      }
    </NavigationContainer>
  );
}