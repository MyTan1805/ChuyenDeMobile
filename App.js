import "react-native-gesture-handler";
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { LilitaOne_400Regular } from "@expo-google-fonts/lilita-one";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { AuthProvider } from "./src/context/AuthContext"; // Đảm bảo đã import

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    "LilitaOne-Regular": LilitaOne_400Regular,
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
