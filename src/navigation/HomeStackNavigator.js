import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../features/aqi/screens/HomeScreen';
import AqiDetailScreen from '../features/aqi/screens/AqiDetailScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AqiDashboard" component={HomeScreen} />

      <Stack.Screen name="AqiDetail" component={AqiDetailScreen} />


    </Stack.Navigator>
  );
};

export default HomeStackNavigator;