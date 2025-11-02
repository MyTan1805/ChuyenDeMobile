import "react-native-gesture-handler"; // PHẢI Ở DÒNG ĐẦU TIÊN
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { View } from "react-native";

// Import font
import { useFonts } from "expo-font";
import { LilitaOne_400Regular } from "@expo-google-fonts/lilita-one";
// Thay thế Inter bằng Nunito
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";

export default function App() {
  // Tải font
  let [fontsLoaded, fontError] = useFonts({
    "LilitaOne-Regular": LilitaOne_400Regular,
    // Tải Nunito
    "Nunito-Regular": Nunito_400Regular,
    "Nunito-Bold": Nunito_700Bold,
  });

  // Hiển thị màn hình trống trong khi tải font
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  // Font đã tải xong, hiển thị ứng dụng
  return <AppNavigator />;
}
