import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';

// ----- CÁC MÀN HÌNH AUTH (XÁC THỰC) -----
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';
// Import thêm nếu bạn đã tạo file này
import NewPasswordScreen from '@/features/auth/screens/NewPasswordScreen'; 
import VerifyEmailScreen from '@/features/auth/screens/VerifyEmailScreen';

// ----- CÁC MÀN HÌNH CHÍNH -----
import HomeScreen from '@/features/aqi/screens/HomeScreen';

// -- Màn hình Cộng đồng & Các màn hình con --
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import WasteClassificationScreen from '@/features/community/screens/WasteClassificationScreen';
import WasteDetailScreen from '@/features/community/screens/WasteDetailScreen';

import PostScreen from '@/features/community/screens/PostScreen';
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';

// ----- CÁC COMPONENT TÙY CHỈNH -----
import CustomTabBar from '@/components/CustomTabBar'; 

const AuthStack = createStackNavigator();
const CommunityStack = createStackNavigator(); // Stack riêng cho luồng Cộng đồng
const MainTab = createBottomTabNavigator();

// ============================================================================
// 1. AUTH NAVIGATOR (Luồng đăng nhập/đăng ký)
// ============================================================================
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      
      {/* Thêm các màn hình này vào nếu bạn muốn dùng */}
      {/* <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} /> */}
      {/* <AuthStack.Screen name="NewPassword" component={NewPasswordScreen} /> */}
    </AuthStack.Navigator>
  );
}

// ============================================================================
// 2. COMMUNITY STACK (Luồng bên trong Tab Cộng Đồng)
// ============================================================================
/**
 * Stack này giúp bạn đi từ màn hình "Cộng đồng" -> "Phân loại rác" -> "Chi tiết"
 * mà vẫn giữ được thanh TabBar ở dưới (hoặc ẩn nó tùy ý).
 */
function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Màn hình chính của Stack này */}
      <CommunityStack.Screen name="CommunityMain" component={CommunityScreen} />
      
      {/* Các màn hình con */}
      <CommunityStack.Screen name="WasteClassification" component={WasteClassificationScreen} />
      <CommunityStack.Screen name="WasteDetail" component={WasteDetailScreen} />
    </CommunityStack.Navigator>
  );
}

// ============================================================================
// 3. MAIN TAB NAVIGATOR (Luồng chính sau khi login)
// ============================================================================
function MainTabNavigator() {
  return (
    <MainTab.Navigator 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }} // Ẩn header mặc định để dùng CustomHeader riêng của từng màn hình
    >
      <MainTab.Screen name="Trang chủ" component={HomeScreen} />
      
      {/* QUAN TRỌNG: Tab Cộng đồng trỏ vào CommunityStackNavigator chứ không phải CommunityScreen */}
      <MainTab.Screen name="Cộng đồng" component={CommunityStackNavigator} />
      
      <MainTab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: true, headerTitle: "Đăng tin mới" }} />
      <MainTab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: true, headerTitle: "Cửa hàng đổi quà" }} />
      <MainTab.Screen name="Hồ sơ" component={ProfileScreen} />
    </MainTab.Navigator>
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
        <ActivityIndicator size="large" color="#2F847C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}