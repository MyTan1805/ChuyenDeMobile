import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View } from 'react-native';
// Import màn hình chính từ thư mục screens
import CreateReportScreen from './screens/CreateReportScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Container chính bao bọc màn hình báo cáo */}
      <View style={styles.contentContainer}>
        <CreateReportScreen />
      </View>
      
      {/* Thanh trạng thái (pin, sóng, giờ) tự động điều chỉnh màu */}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    // Thêm padding top nếu cần thiết trên một số thiết bị Android đặc thù
    // nhưng SafeAreaView thường đã xử lý tốt việc này.
  }
});