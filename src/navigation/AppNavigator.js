import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';

// ----- CÁC MÀN HÌNH (AUTH) -----
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';

// ----- CÁC MÀN HÌNH (MAIN) -----
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import AqiDetailScreen from '@/features/aqi/screens/AqiDetailScreen'; 
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import PostScreen from '@/features/community/screens/PostScreen';
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';

// ----- COMPONENT TÙY CHỈNH -----
import CustomTabBar from '@/components/CustomTabBar';

// Khởi tạo Navigators
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator(); 
const MainTab = createBottomTabNavigator();
const MainStack = createStackNavigator(); 

// 1. Auth Navigator (Luồng Đăng nhập)
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// 2. Home Stack (Dashboard -> Detail AQI)
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AqiDashboard" component={HomeScreen} />
      <HomeStack.Screen name="AqiDetail" component={AqiDetailScreen} />
    </HomeStack.Navigator>
  );
}

// 3. Main Tab Navigator (5 Tab chính)
function MainTabNavigator() {
  return (
    <MainTab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {/* Tab Trang chủ chứa HomeStack */}
      <MainTab.Screen name="Trang chủ" component={HomeStackNavigator} />
      
      <MainTab.Screen name="Cộng đồng" component={CommunityScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Hồ sơ" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

// 4. Main Stack (Bao bọc Tab + Các màn hình con đè lên Tab)
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
    </MainStack.Navigator>
  );
}

// --- ROOT COMPONENT ---
export default function AppNavigator() {
  const { user, isLoading, checkAuthState } = useUserStore((state) => state);

  useEffect(() => {
    const unsubscribe = checkAuthState();
    return () => unsubscribe();
  }, [checkAuthState]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}