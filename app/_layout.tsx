import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      {/* 
        Expo Router sẽ tự động tìm các thư mục (auth), (tabs) 
        và áp dụng layout này cho chúng.
        Chúng ta chỉ cần định nghĩa các màn hình đơn lẻ nếu cần tùy chỉnh đặc biệt.
      */}
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}