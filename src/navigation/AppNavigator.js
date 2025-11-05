import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { View, Text, Button } from 'react-native';

// Import Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';
// Màn hình giả để test sau khi đăng nhập
function HomeScreen() {
    const { logout } = useContext(AuthContext);
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Đăng nhập thành công!</Text>
            <Button title="Đăng xuất" onPress={() => logout()} />
        </View>
    );
}

const Stack = createStackNavigator();

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

function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang Chủ' }}/>
            {/* Thêm các màn hình chính của ứng dụng tại đây */}
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { user } = useContext(AuthContext);
    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}