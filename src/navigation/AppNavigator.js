import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
                <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
                <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
