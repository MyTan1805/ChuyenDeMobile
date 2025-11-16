import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthContext } from '../context/AuthContext';

// Import Component tùy chỉnh
import CustomTabBar from '../component/CustomTabBar';

// Import các màn hình xác thực
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';

// Import các màn hình chính của ứng dụng
import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen'; // Giả sử bạn có màn hình này
import PostScreen from '../screens/PostScreen';         // Giả sử bạn có màn hình này
import StoreScreen from '../screens/StoreScreen';         // Giả sử bạn có màn hình này
import ProfileScreen from '../screens/ProfileScreen';     // Giả sử bạn có màn hình này

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// === CÁC LUỒNG ĐIỀU HƯỚNG ===

// 1. Luồng xác thực (Khi người dùng chưa đăng nhập)
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
        </Stack.Navigator>
    );
}

// 2. Luồng chính của ứng dụng (Khi người dùng đã đăng nhập)
//    Chúng ta sẽ dùng BottomTabNavigator ở đây
function MainAppTabNavigator() {
  return (
    // Sử dụng prop `tabBar` để thay thế thanh điều hướng mặc định bằng component của chúng ta
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Trang chủ" component={HomeScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Cộng đồng" component={CommunityScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Đăng tin" component={PostScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Cửa hàng" component={StoreScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Hồ sơ" component={ProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}


// === COMPONENT ĐIỀU HƯỚNG GỐC ===
export default function AppNavigator() {
    const { user } = useContext(AuthContext); // Lấy trạng thái đăng nhập từ Context

    return (
        <NavigationContainer>
            {/* Dựa vào biến `user` để quyết định hiển thị luồng nào */}
            {user ? <MainAppTabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
}