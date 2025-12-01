import React, { useEffect, useState } from "react";
import {
  View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Image, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { Svg, Path, Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { useUserStore } from "@/store/userStore";
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loginGuest } = useUserStore();

 const redirectUri = makeRedirectUri({
  scheme: 'ecomate', // Thay bằng scheme của bạn
  useProxy: false
});

const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: "982272940577-flak0p8ehmcm6dphhkohtvp7u3q6om5c.apps.googleusercontent.com",
  iosClientId: "982272940577-b1pghar1amret407nno3ums1t6ve4shh.apps.googleusercontent.com",
  redirectUri: redirectUri
});

// Debug: xem redirect URI
useEffect(() => {
  console.log("📱 Redirect URI:", redirectUri);
}, []);

  useEffect(() => {
    console.log("📱 Request config:", request?.redirectUri);
    
    if (response?.type === "success") {
      console.log("✅ Google login success");
      console.log("Response params:", response.params);
      
      // Lấy ID token từ response
      const { id_token, authentication } = response.params;
      const idToken = id_token || authentication?.idToken;
      
      if (idToken) {
        handleFirebaseGoogleLogin(idToken);
      } else {
        console.error("❌ No ID token found in response");
        Alert.alert("Lỗi", "Không nhận được ID token từ Google");
      }
    } else if (response?.type === "error") {
      console.error("❌ Google Error:", response.error);
      Alert.alert("Lỗi Google", response.error?.message || "Đăng nhập thất bại");
    } else if (response?.type === "cancel") {
      console.log("⚠️ User cancelled Google login");
    }
  }, [response]);

  const handleFirebaseGoogleLogin = async (idToken) => {
    setLoading(true);
    try {
      console.log("🔐 Signing in with Firebase...");
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      console.log("✅ Firebase login success:", result.user.email);
      Alert.alert("Thành công", `Chào mừng ${result.user.email}!`);
    } catch (error) {
      console.error("❌ Firebase Login Error:", error);
      Alert.alert("Lỗi", error.message || "Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved_email");
        const savedPassword = await AsyncStorage.getItem("saved_password");
        if (savedEmail && savedPassword) {
          setEmail(savedEmail); 
          setPassword(savedPassword); 
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Load credentials error:", error);
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
        if (rememberMe) {
          await AsyncStorage.setItem("saved_email", email); 
          await AsyncStorage.setItem("saved_password", password);
        } else {
          await AsyncStorage.removeItem("saved_email"); 
          await AsyncStorage.removeItem("saved_password");
        }
      } else {
        Alert.alert("Thất bại", "Email hoặc mật khẩu không đúng.");
      }
    } catch (e) { 
      Alert.alert("Lỗi", "Đã xảy ra lỗi kết nối."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    await loginGuest();
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    console.log("🔘 Google button pressed");
    if (!request) {
      console.log("⚠️ Request not ready yet");
      Alert.alert("Vui lòng đợi", "Đang chuẩn bị đăng nhập...");
      return;
    }
    promptAsync();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ImageBackground 
            source={require("@/assets/images/header.jpg")} 
            resizeMode="cover" 
            style={styles.headerBackground}
          >
            <Text style={styles.headerTitle}>ECOMATE</Text>
          </ImageBackground>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Đăng nhập</Text>

            <CustomTextInput 
              placeholder="Nhập email" 
              value={email} 
              onChangeText={setEmail}
              icon={
                <Svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <Path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" fill="black" />
                </Svg>
              }
            />
            
            <CustomTextInput 
              placeholder="Nhập mật khẩu" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              icon={
                <Svg width="16" height="21" viewBox="0 0 16 21" fill="none">
                  <Path d="M8 16C8.53043 16 9.03914 15.7893 9.41421 15.4142C9.78929 15.0391 10 14.5304 10 14C10 13.4696 9.78929 12.9609 9.41421 12.5858C9.03914 12.2107 8.53043 12 8 12C7.46957 12 6.96086 12.2107 6.58579 12.5858C6.21071 12.9609 6 13.4696 6 14C6 14.5304 6.21071 15.0391 6.58579 15.4142C6.96086 15.7893 7.46957 16 8 16ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 8.46957 0.210714 7.96086 0.585786 7.58579C0.960859 7.21071 1.46957 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="black" />
                </Svg>
              }
            />

            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                onPress={() => setRememberMe(!rememberMe)} 
                style={styles.rememberMe}
              >
                <Svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                  <Circle cx="6" cy="6" r="6" fill={rememberMe ? "#2F847C" : "#D9D9D9"} />
                  {rememberMe && (
                    <Path 
                      d="M3 6L5 8L9 4" 
                      stroke="white" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}
                </Svg>
                <Text style={[
                  styles.optionsText, 
                  rememberMe && { color: "#2F847C", fontFamily: "Nunito-Bold" }
                ]}>
                  Nhớ mật khẩu
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={[styles.optionsText, styles.link]}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.orText}>Hoặc</Text>

            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={[
                  styles.socialButton, 
                  (!request || loading) && { opacity: 0.5 }
                ]}
                onPress={handleGoogleLogin}
                disabled={!request || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <Image 
                    source={{ uri: "https://img.icons8.com/color/48/000000/google-logo.png" }} 
                    style={styles.socialIcon} 
                    resizeMode="contain" 
                  />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={40} color="#1877F2" />
              </TouchableOpacity>
            </View>

            <View style={styles.linkContainer}>
              <Text style={styles.bottomText}>{"Chưa có tài khoản? "}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.bottomText, styles.link, { color: "#46e49aff" }]}>
                  Đăng kí
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={{ marginTop: 10, padding: 5 }} 
              onPress={handleGuestLogin} 
              disabled={loading}
            >
              <Text style={[styles.bottomText, styles.link]}>
                Tiếp tục với vai trò là khách
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flexGrow: 1 },
  headerBackground: { 
    width: "100%", 
    height: 280, 
    alignItems: "center", 
    justifyContent: "center", 
    borderBottomRightRadius: 180, 
    overflow: "hidden" 
  },
  headerTitle: { 
    fontFamily: "LilitaOne-Regular", 
    fontSize: 60, 
    color: "#fff", 
    marginTop: 40 
  },
  formContainer: { 
    flex: 1, 
    alignItems: "center", 
    paddingHorizontal: 33, 
    paddingTop: 30, 
    paddingBottom: 40, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontFamily: "Inter-Bold", 
    fontSize: 35, 
    color: "#000", 
    marginBottom: 30 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#EEEEEE", 
    borderRadius: 30, 
    width: "100%", 
    height: 49, 
    marginBottom: 19, 
    paddingHorizontal: 19 
  },
  icon: { marginRight: 10 },
  input: { 
    flex: 1, 
    height: "100%", 
    fontFamily: "Nunito-Regular", 
    fontSize: 18, 
    color: "#000" 
  },
  optionsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%", 
    marginBottom: 30, 
    paddingHorizontal: 8 
  },
  rememberMe: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 4 
  },
  optionsText: { 
    fontFamily: "Nunito-Regular", 
    fontSize: 15, 
    color: "#000", 
    marginLeft: 6 
  },
  link: { 
    fontFamily: "Nunito-Bold", 
    textDecorationLine: "underline" 
  },
  button: { 
    backgroundColor: "#2F847C", 
    borderRadius: 30, 
    paddingVertical: 15, 
    width: "100%", 
    alignItems: "center", 
    elevation: 5, 
    marginBottom: 20 
  },
  buttonText: { 
    color: "#FFFFFF", 
    fontSize: 20, 
    fontFamily: "Nunito-Bold" 
  },
  orText: { 
    fontFamily: "Nunito-Bold", 
    fontSize: 15, 
    color: "#000", 
    textDecorationLine: "underline", 
    marginBottom: 20 
  },
  socialContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    width: "100%", 
    marginBottom: 20, 
    alignItems: "center" 
  },
  socialButton: { 
    marginHorizontal: 20, 
    padding: 10 
  },
  socialIcon: { 
    width: 40, 
    height: 40 
  },
  linkContainer: { 
    flexDirection: "row" 
  },
  bottomText: { 
    fontFamily: "Nunito-Regular", 
    fontSize: 15, 
    color: "#000" 
  },
});