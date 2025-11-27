import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';

// ==================== IMPORT MÀN HÌNH ====================

// 1. AUTH 
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';
import VerifyEmailScreen from '@/features/auth/screens/VerifyEmailScreen';
// ĐÃ XOÁ: import NewPasswordScreen...

// 2. AQI & HOME 
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import AqiDetailScreen from '@/features/aqi/screens/AqiDetailScreen'; 
import ChatbotScreen from '@/features/chatbot/screens/ChatbotScreen';

// 3. COMMUNITY 
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import WasteClassificationScreen from '@/features/community/screens/WasteClassificationScreen';
import WasteDetailScreen from '@/features/community/screens/WasteDetailScreen';
import PostScreen from '@/features/community/screens/PostScreen';

// 4. GAMIFICATION & PROFILE
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';

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

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [
    prefix,
    'ecomate://',
    'https://ecoapp-dc865.firebaseapp.com',
  ],
  config: {
    screens: {
      AuthFlow: {
        screens: {
          // ĐÃ XOÁ: Cấu hình NewPassword ở đây để app không chặn link reset nữa
          VerifyEmail: {
            path: 'verify-email',
            parse: {
              oobCode: (oobCode) => oobCode,
              mode: (mode) => mode,
            },
          },
        },
      },
    },
  },
  // Giữ lại logic xử lý verifyEmail, nhưng bỏ resetPassword
  getStateFromPath: (path, options) => {
    const url = Linking.parse(path);

    if (url.queryParams?.mode) {
      const { mode, oobCode } = url.queryParams;

      // Nếu là verify email thì mở app vào màn hình VerifyEmail
      if (mode === 'verifyEmail') {
        return {
          routes: [
            {
              name: 'VerifyEmail',
              params: { oobCode, type: 'emailVerification' } // Bỏ AuthFlow wrapper nếu không cần thiết hoặc giữ nguyên cấu trúc cũ của bạn
            },
          ],
        };
      }

      // ĐÃ XOÁ: Logic check mode === 'resetPassword' để không mở app
    }

    return options.getStateFromPath(path, options);
  },
};

// 1. NAVIGATOR XÁC THỰC
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      {/* ĐÃ XOÁ: AuthStack.Screen name="NewPassword" */}
    </AuthStack.Navigator>
  );
}

// ==================== 2. HOME STACK ====================
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AqiDashboard" component={HomeScreen} />
      <HomeStack.Screen name="AqiDetail" component={AqiDetailScreen} />

      <HomeStack.Screen name="CreateReport" component={CreateReportScreen} />
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
// ... (Giữ nguyên MainTabNavigator, MainNavigator, AppNavigator như cũ)
// Chỉ cần đảm bảo bỏ NewPasswordScreen ở import và AuthNavigator
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
      <MainStack.Screen name="Chatbot" component={ChatbotScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
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
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}