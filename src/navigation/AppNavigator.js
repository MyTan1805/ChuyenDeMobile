import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';

// ----- CÁC MÀN HÌNH -----
// Luồng Xác thực
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';

// Luồng Chính
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import PostScreen from '@/features/community/screens/PostScreen';
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
// 👇 1. THÊM IMPORT EDIT PROFILE
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';

// ----- CÁC COMPONENT TÙY CHỈNH -----
import CustomTabBar from '@/components/CustomTabBar';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const MainStack = createStackNavigator(); // 👇 2. TẠO THÊM STACK CHO LUỒNG CHÍNH

// ============================================================================
// 1. LUỒNG XÁC THỰC (AUTH NAVIGATOR)
// ============================================================================
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

// ============================================================================
// 2. LUỒNG TAB CHÍNH (MAIN TAB NAVIGATOR)
// ============================================================================
function MainTabNavigator() {
  return (
    <MainTab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <MainTab.Screen name="Trang chủ" component={HomeScreen} options={{ headerShown: false }} />
      <MainTab.Screen name="Cộng đồng" component={CommunityScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Hồ sơ" component={ProfileScreen} options={{ headerShown: false }} />
    </MainTab.Navigator>
  );
}

// ============================================================================
// 3. LUỒNG STACK CHÍNH (Bao bọc Tab + Các màn hình con như EditProfile)
// ============================================================================
// 👇 Hàm này mới thêm vào để xử lý EditProfile
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Màn hình mặc định là Tab Bar */}
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Các màn hình con khác (sẽ đè lên Tab Bar) */}
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
    </MainStack.Navigator>
  );
}

// ============================================================================
// COMPONENT ĐIỀU HƯỚNG GỐC
// ============================================================================
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
      {/* 👇 Thay MainTabNavigator bằng MainNavigator mới tạo */}
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}