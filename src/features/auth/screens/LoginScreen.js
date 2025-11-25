import React, { useState, useEffect } from 'react';
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useUserStore } from '@/store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. Import AsyncStorage

const { height } = Dimensions.get('window');

const CustomTextInput = ({ placeholder, icon, secureTextEntry = false, value, onChangeText }) => (
  <View style={styles.inputContainer}>
    <View style={styles.icon}>{icon}</View>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#888"
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
    />
  </View>
);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // 2. Thêm state Remember Me

  const { login, loginGuest } = useUserStore();

  // 3. Load tài khoản đã lưu khi mở màn hình
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        const savedPassword = await AsyncStorage.getItem('saved_password');

        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true); // Tự động bật tích
        }
      } catch (error) {
        console.log("Lỗi tải thông tin đăng nhập:", error);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        // 4. Xử lý Lưu hoặc Xóa mật khẩu khi đăng nhập thành công
        try {
          if (rememberMe) {
            await AsyncStorage.setItem('saved_email', email);
            await AsyncStorage.setItem('saved_password', password);
          } else {
            await AsyncStorage.removeItem('saved_email');
            await AsyncStorage.removeItem('saved_password');
          }
        } catch (storageError) {
          console.log("Lỗi lưu storage:", storageError);
        }
        // AppNavigator sẽ tự chuyển màn hình nhờ onAuthStateChanged
      } else {
        // Xử lý lỗi đăng nhập thất bại
        let friendlyMessage = "Email hoặc mật khẩu không đúng.";
        const errCode = result.error?.code;
        if (errCode === 'auth/user-not-found' || errCode === 'auth/wrong-password' || errCode === 'auth/invalid-credential') {
          friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
        } else if (errCode === 'auth/invalid-email') {
          friendlyMessage = 'Email không hợp lệ.';
        }
        Alert.alert("Đăng nhập thất bại", friendlyMessage);
      }
    } catch (error) {
      console.log("Login Error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const result = await loginGuest();
      if (!result.success) {
        Alert.alert("Lỗi", "Không thể đăng nhập khách: " + result.error?.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Hàm toggle checkbox
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ImageBackground source={require('../../../assets/images/header.jpg')} resizeMode="cover" style={styles.headerBackground}>
          <Text style={styles.headerTitle}>ECOMATE</Text>
        </ImageBackground>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Đăng nhập</Text>

          <CustomTextInput
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            icon={<Svg width="20" height="16" viewBox="0 0 20 16" fill="none"><Path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" fill="black" /></Svg>}
          />
          <CustomTextInput
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Svg width="16" height="21" viewBox="0 0 16 21" fill="none"><Path d="M8 16C8.53043 16 9.03914 15.7893 9.41421 15.4142C9.78929 15.0391 10 14.5304 10 14C10 13.4696 9.78929 12.9609 9.41421 12.5858C9.03914 12.2107 8.53043 12 8 12C7.46957 12 6.96086 12.2107 6.58579 12.5858C6.21071 12.9609 6 13.4696 6 14C6 14.5304 6.21071 15.0391 6.58579 15.4142C6.96086 15.7893 7.46957 16 8 16ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 8.46957 0.210714 7.96086 0.585786 7.58579C0.960859 7.21071 1.46957 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="black" /></Svg>}
          />

          <View style={styles.optionsContainer}>
            {/* 6. Sửa UI phần Nhớ mật khẩu thành nút bấm được và đổi màu khi active */}
            <TouchableOpacity onPress={toggleRememberMe} style={styles.rememberMe} activeOpacity={0.7}>
              <Svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                {/* Thay đổi màu fill dựa trên state rememberMe */}
                <Circle cx="6" cy="6" r="6" fill={rememberMe ? "#2F847C" : "#D9D9D9"} />
                {rememberMe && (
                  // Thêm dấu tích nhỏ bên trong nếu đang active
                  <Path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </Svg>
              <Text style={[styles.optionsText, rememberMe && { color: '#2F847C', fontFamily: 'Nunito-Bold' }]}>
                Nhớ mật khẩu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={[styles.optionsText, styles.link]}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>Hoặc</Text>

          {/* --- ĐÃ SỬA LINK ẢNH FACEBOOK & GOOGLE --- */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
                <Image 
                  style={styles.socialIcon} 
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/300/300221.png" }} // Google Icon
                />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
                <Image 
                  style={styles.socialIcon} 
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/5968/5968764.png" }} // Facebook Icon
                />
            </TouchableOpacity>
          </View>

          <View style={styles.linkContainer}>
            <Text style={styles.bottomText}>{"Chưa có tài khoản? "}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}><Text style={[styles.bottomText, styles.link, { color: '#46e49aff' }]}>Đăng kí</Text></TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ marginTop: 10, padding: 5 }}
            onPress={handleGuestLogin}
            disabled={loading}
          >
            <Text style={[styles.bottomText, styles.link]}>Tiếp tục với vai trò là khách</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flexGrow: 1, },
  headerBackground: { width: '100%', height: 306, alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: 180, overflow: 'hidden', },
  headerTitle: { fontFamily: 'LilitaOne-Regular', fontSize: 60, color: '#fff', marginTop: 40, },
  formContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 33, paddingTop: 30, paddingBottom: 40, backgroundColor: '#fff', },
  title: { fontFamily: 'Inter-Bold', fontSize: 35, color: '#000', marginBottom: 30, },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEEEEE', borderRadius: 30, width: '100%', height: 49, marginBottom: 19, paddingHorizontal: 19, },
  icon: { marginRight: 10, },
  input: { flex: 1, height: '100%', fontFamily: 'Nunito-Regular', fontSize: 18, color: '#000', },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30, paddingHorizontal: 8, },
  rememberMe: { flexDirection: 'row', alignItems: 'center', padding: 4 }, // Thêm padding để dễ bấm
  optionsText: { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#000', marginLeft: 6, },
  link: { fontFamily: 'Nunito-Bold', textDecorationLine: 'underline', },
  button: { backgroundColor: "#2F847C", borderRadius: 30, paddingVertical: 15, width: '100%', alignItems: 'center', elevation: 5, marginBottom: 20, },
  buttonText: { color: "#FFFFFF", fontSize: 20, fontFamily: 'Nunito-Bold', },
  orText: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#000', textDecorationLine: 'underline', marginBottom: 20, },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 20, },
  socialButton: { marginHorizontal: 30, },
  socialIcon: { width: 30, height: 30 }, // Tăng size lên chút cho đẹp
  linkContainer: { flexDirection: 'row', },
  bottomText: { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#000', }
});