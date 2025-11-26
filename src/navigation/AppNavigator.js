import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ----- QUẢN LÝ TRẠNG THÁI -----
import { useUserStore } from '@/store/userStore';

// ==================== IMPORT MÀN HÌNH ====================

// 1. AUTH 
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';

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

// ----- COMPONENT -----
import CustomTabBar from '@/components/CustomTabBar'; 

// ==================== KHỞI TẠO ====================
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();       
const CommunityStack = createStackNavigator();  
const MainTab = createBottomTabNavigator();    
const MainStack = createStackNavigator();      

// ==================== 1. AUTH NAVIGATOR ====================
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

// ==================== 2. HOME STACK ====================
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AqiDashboard" component={HomeScreen} />
      <HomeStack.Screen name="AqiDetail" component={AqiDetailScreen} />
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
      <CommunityStack.Screen name="EcoLibrary" component={EcoLibraryScreen} /> 
      <CommunityStack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <CommunityStack.Screen name="QuizCollection" component={QuizCollectionScreen} /> 
      <CommunityStack.Screen name="Quiz" component={QuizScreen} />
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
      <MainStack.Screen name="Chatbot" component={ChatbotScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
    </MainStack.Navigator>
  );
}

// ==================== ROOT APP ====================
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
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}