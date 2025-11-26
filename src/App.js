import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'LogoFont': Pacifico_400Regular,     
    'LilitaOne-Regular': LilitaOne_400Regular, 
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,         
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}