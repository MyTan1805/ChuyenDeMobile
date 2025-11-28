import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import 2 màn hình
import AqiDashboardScreen from '../features/aqi/screens/AqiDashboardScreen';
import AqiDetailScreen from '../features/aqi/screens/AqiDetailScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Màn hình Dashboard là màn hình đầu tiên */}
      <Stack.Screen name="AqiDashboard" component={AqiDashboardScreen} />

      {/* Màn hình Chi tiết */}
      <Stack.Screen name="AqiDetail" component={AqiDetailScreen} />


    </Stack.Navigator>
  );
};

export default HomeStackNavigator;