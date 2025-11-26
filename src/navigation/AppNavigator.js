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

// ----- CÁC MÀN HÌNH AUTH -----
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgetPasswordScreen';
import VerifyEmailScreen from '@/features/auth/screens/VerifyEmailScreen';

// ----- CÁC MÀN HÌNH CHÍNH -----
import HomeScreen from '@/features/aqi/screens/HomeScreen';
import CommunityScreen from '@/features/community/screens/CommunityScreen';
import PostScreen from '@/features/community/screens/PostScreen';
import StoreScreen from '@/features/gamification/screens/StoreScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';

// ----- COMPONENT -----
import CustomTabBar from '@/components/CustomTabBar';

const AuthStack = createStackNavigator();
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
    <MainTab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <MainTab.Screen name="Trang chủ" component={HomeScreen} options={{ headerShown: false }} />
      <MainTab.Screen name="Cộng đồng" component={CommunityScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: true }} />
      <MainTab.Screen name="Hồ sơ" component={ProfileScreen} options={{ headerShown: false }} />
    </MainTab.Navigator>
  );
}

// Stack chứa Tab Bar và các màn hình con khác
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />

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
        <ActivityIndicator size="large" />
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