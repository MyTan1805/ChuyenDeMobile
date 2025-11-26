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

// Luồng Chính - Sử dụng tên màn hình gốc của bạn
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import PostScreen from '@/features/community/screens/PostScreen';
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';

// ----- CÁC COMPONENT TÙY CHỈNH -----
import CustomTabBar from '@/components/CustomTabBar'; 


const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

// ============================================================================
// CÁC LUỒNG ĐIỀU HƯỚNG (NAVIGATORS)
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

/**
 * Luồng chính của ứng dụng sau khi đăng nhập, sử dụng Bottom Tab.
 */
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
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}