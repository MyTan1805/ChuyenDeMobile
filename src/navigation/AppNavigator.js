import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';

// ==================== IMPORT CÁC MÀN HÌNH ====================

// 1. AUTH (Xác thực)
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';
import VerifyEmailScreen from '@/features/auth/screens/VerifyEmailScreen';

// 2. HOME & AQI 
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import AqiDetailScreen from '@/features/aqi/screens/AqiDetailScreen'; 
import ChatbotScreen from '@/features/chatbot/screens/ChatbotScreen';

// 3. REPORTS (BÁO CÁO)
// [QUAN TRỌNG] Đảm bảo import đúng tên file và đường dẫn 'reports'
import CreateReportScreen from '@/features/reports/screens/CreateReportScreen';
import ReportHistoryScreen from '@/features/reports/screens/ReportsHistoryScreen';
import ReportDetailScreen from '@/features/reports/screens/ReportDetailScreen';

// 4. COMMUNITY (CỘNG ĐỒNG)
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import WasteClassificationScreen from '@/features/community/screens/WasteClassificationScreen';
import WasteDetailScreen from '@/features/community/screens/WasteDetailScreen';
import PostScreen from '@/features/community/screens/PostScreen';

// 5. PROFILE & GAMIFICATION (HỒ SƠ)
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';

// 6. MAP (BẢN ĐỒ)
import EnvironmentalMapScreen from '@/features/map/screens/EnvironmentalMapScreen';

// 7. ADMIN PORTAL
import AdminNavigator from '@/navigation/AdminNavigator'; // Đường dẫn đến AdminNavigator

// 8. ANALYTICS
import AnalyticsScreen from '@/features/analytics/screens/AnalyticsScreen';


// ----- COMPONENT -----
import CustomTabBar from '@/components/CustomTabBar'; 

// ==================== KHỞI TẠO NAVIGATOR ====================
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();       
const CommunityStack = createStackNavigator();     
const MainTab = createBottomTabNavigator();
const MainStack = createStackNavigator(); 

// ==================== CẤU HÌNH LINKING ====================
const prefix = Linking.createURL('/');
const linking = {
  prefixes: [prefix, 'ecomate://', 'https://ecoapp-dc865.firebaseapp.com'],
  config: {
    screens: {
      AuthFlow: {
        screens: {
          VerifyEmail: {
            path: 'verify-email',
            parse: { oobCode: (code) => code, mode: (m) => m },
          },
        },
      },
    },
  },
  getStateFromPath: (path, options) => {
    const url = Linking.parse(path);
    if (url.queryParams?.mode === 'verifyEmail') {
      return {
        routes: [{ name: 'VerifyEmail', params: { oobCode: url.queryParams.oobCode } }],
      };
    }
    return options.getStateFromPath(path, options);
  },
};

// ==================== 1. AUTH NAVIGATOR ====================
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </AuthStack.Navigator>
  );
}

// ==================== 2. HOME STACK ====================
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AqiDashboard" component={HomeScreen} />
      <HomeStack.Screen name="AqiDetail" component={AqiDetailScreen} />
      
      {/* Các màn hình truy cập từ Home */}
      <HomeStack.Screen name="CreateReport" component={CreateReportScreen} />
      <HomeStack.Screen name="EnvironmentalMap" component={EnvironmentalMapScreen} />
    </HomeStack.Navigator>
  );
}

// ==================== 3. COMMUNITY STACK ====================
function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="CommunityMain" component={CommunityScreen} />
      <CommunityStack.Screen name="WasteClassification" component={WasteClassificationScreen} />
      <CommunityStack.Screen name="WasteDetail" component={WasteDetailScreen} />
    </CommunityStack.Navigator>
  );
}

// ==================== 4. MAIN TAB NAVIGATOR ====================
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
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* Các màn hình phụ */}
      <MainStack.Screen name="Chatbot" component={ChatbotScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      
      {/* [BỔ SUNG] Đăng ký màn hình Lịch sử & Chi tiết ở đây để gọi từ Profile */}
      <MainStack.Screen name="ReportHistory" component={ReportHistoryScreen} />
      <MainStack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <MainStack.Screen name="AdminPortal" component={AdminNavigator} />
      
      <MainStack.Screen name="Analytics" component={AnalyticsScreen} />

      
    </MainStack.Navigator>
  );
}

// ==================== APP NAVIGATOR ====================
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
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}