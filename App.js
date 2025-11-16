import 'react-native-gesture-handler';
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { View } from "react-native";
import { useFonts } from "expo-font";

// BƯỚC 1: Tên import đã được đổi thành "LilitaOne_400Regular"
import { LilitaOne_400Regular } from "@expo-google-fonts/lilita-one";
import { Quicksand_500Medium } from '@expo-google-fonts/quicksand';
//import { Pacifico_400Regular } from '@expo-google-fonts/pacifico'; 
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  let [fontsLoaded, fontError] = useFonts({

    //"LogoFont": Pacifico_400Regular, 
    "LogoFont": Quicksand_500Medium,
    "Lilitatone-Regular": LilitaOne_400Regular,
    "Nunito-Regular": Nunito_400Regular,
    "Nunito-Bold": Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}