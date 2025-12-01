import React, { useState, useEffect } from 'react';
import {
    View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView,
    TextInput, TouchableOpacity, Image, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from '@/store/userStore';

// --- GOOGLE IMPORTS ---
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

const CustomTextInput = ({ placeholder, icon, secureTextEntry = false, value, onChangeText }) => (
    <View style={styles.inputContainer}>
        <View style={styles.icon}>{icon}</View>
        <TextInput
            style={styles.input} placeholder={placeholder} placeholderTextColor="#888"
            secureTextEntry={secureTextEntry} value={value} onChangeText={onChangeText} autoCapitalize="none"
        />
    </View>
);

const AuthHeader = () => (
    <ImageBackground style={styles.headerBackground} source={require('@/assets/images/header.jpg')} resizeMode="cover">
        <Text style={styles.headerTitle}>ECOMATE</Text>
    </ImageBackground>
);

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, sendVerification } = useUserStore();

    // --- CẤU HÌNH GOOGLE (GIỐNG LOGIN) ---
    const redirectUri = makeRedirectUri({ scheme: 'ecomate', path: 'auth' });
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        iosClientId: "982272940577-b1pghar1amret407nno3ums1t6ve4shh.apps.googleusercontent.com",
        androidClientId: "982272940577-p0vi3v54rrqqtslfmr3ar3l9hh2tp2u1.apps.googleusercontent.com",
        webClientId: "982272940577-flak0p8ehmcm6dphhkohtvp7u3q6om5c.apps.googleusercontent.com",
        redirectUri: redirectUri,
    });

    useEffect(() => {
        if (response?.type === "success") {
          const { id_token } = response.params;
          const credential = GoogleAuthProvider.credential(id_token);
          handleFirebaseSocialLogin(credential);
        } else if (response?.type === "error") {
           Alert.alert("Lỗi Google", "Đăng nhập thất bại.");
        }
    }, [response]);

    const handleFirebaseSocialLogin = async (credential) => {
        setLoading(true);
        try {
          await signInWithCredential(auth, credential);
        } catch (error) {
          Alert.alert("Lỗi", error.message);
        } finally {
          setLoading(false);
        }
    };
    // -------------------------------------

    const handleRegister = async () => {
        if (!name || !email || !password) { Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin."); return; }
        setLoading(true);
        try {
            const result = await register(email, password, name); // Lưu ý: hàm register trong store nên nhận thêm name để update profile
            if (result.success) {
                await sendVerification(result.user);
                Alert.alert("Đăng ký thành công!", "Vui lòng kiểm tra email để xác nhận tài khoản.");
            } else {
                let msg = "Đã có lỗi xảy ra.";
                if (result.error.code === 'auth/email-already-in-use') msg = 'Email này đã được sử dụng.';
                Alert.alert("Đăng ký thất bại", msg);
            }
        } catch (error) { Alert.alert("Lỗi", "Lỗi không mong muốn."); } 
        finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <AuthHeader />
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Đăng kí</Text>

                        <CustomTextInput placeholder="Nhập họ tên" value={name} onChangeText={setName}
                            icon={<Svg width="20" height="21" viewBox="0 0 20 21" fill="none"><Path d="M13.646 10.7155C14.6264 9.94415 15.342 8.88642 15.6933 7.68944C16.0445 6.49246 16.014 5.21576 15.6058 4.03696C15.1977 2.85817 14.4323 1.83589 13.4161 1.11235C12.3999 0.388815 11.1835 0 9.93603 0C8.68858 0 7.47215 0.388815 6.45596 1.11235C5.43978 1.83589 4.67438 2.85817 4.26624 4.03696C3.85811 5.21576 3.82754 6.49246 4.17879 7.68944C4.53004 8.88642 5.24564 9.94415 6.22603 10.7155C4.54611 11.3885 3.08032 12.5048 1.98492 13.9454C0.88953 15.386 0.205595 17.0968 0.00603184 18.8955C-0.00841357 19.0268 0.00314838 19.1597 0.0400573 19.2866C0.0769662 19.4134 0.138499 19.5317 0.221143 19.6348C0.388051 19.843 0.630815 19.9763 0.896032 20.0055C1.16125 20.0347 1.42719 19.9573 1.63536 19.7904C1.84352 19.6235 1.97686 19.3807 2.00603 19.1155C2.22562 17.1607 3.15772 15.3553 4.62425 14.0443C6.09078 12.7333 7.98893 12.0085 9.95603 12.0085C11.9231 12.0085 13.8213 12.7333 15.2878 14.0443C16.7543 15.3553 17.6864 17.1607 17.906 19.1155C17.9332 19.3612 18.0505 19.5882 18.2351 19.7525C18.4198 19.9169 18.6588 20.007 18.906 20.0055H19.016C19.2782 19.9753 19.5178 19.8428 19.6826 19.6367C19.8474 19.4307 19.9241 19.1679 19.896 18.9055C19.6955 17.1017 19.0079 15.3865 17.9069 13.9437C16.8059 12.5009 15.3329 11.385 13.646 10.7155ZM9.93603 10.0055C9.14491 10.0055 8.37155 9.7709 7.71375 9.33137C7.05595 8.89185 6.54326 8.26713 6.24051 7.53623C5.93776 6.80533 5.85855 6.00106 6.01289 5.22513C6.16723 4.44921 6.54819 3.73648 7.1076 3.17707C7.66701 2.61766 8.37975 2.2367 9.15567 2.08235C9.93159 1.92801 10.7359 2.00723 11.4668 2.30998C12.1977 2.61273 12.8224 3.12542 13.2619 3.78321C13.7014 4.44101 13.936 5.21437 13.936 6.0055C13.936 7.06636 13.5146 8.08378 12.7645 8.83392C12.0143 9.58407 10.9969 10.0055 9.93603 10.0055Z" fill="black" /></Svg>}
                        />
                        <CustomTextInput placeholder="Nhập email" value={email} onChangeText={setEmail}
                            icon={<Svg width="20" height="16" viewBox="0 0 20 16" fill="none"><Path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" fill="black" /></Svg>}
                        />
                        <CustomTextInput placeholder="Nhập mật khẩu" value={password} onChangeText={setPassword} secureTextEntry
                            icon={<Svg width="16" height="21" viewBox="0 0 16 21" fill="none"><Path d="M8 16C8.53043 16 9.03914 15.7893 9.41421 15.4142C9.78929 15.0391 10 14.5304 10 14C10 13.4696 9.78929 12.9609 9.41421 12.5858C9.03914 12.2107 8.53043 12 8 12C7.46957 12 6.96086 12.2107 6.58579 12.5858C6.21071 12.9609 6 13.4696 6 14C6 14.5304 6.21071 15.0391 6.58579 15.4142C6.96086 15.7893 7.46957 16 8 16ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 8.46957 0.210714 7.96086 0.585786 7.58579C0.960859 7.21071 1.46957 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="black" /></Svg>}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Đăng kí</Text>}
                        </TouchableOpacity>

                        <Text style={styles.orText}>Hoặc</Text>

                        <View style={styles.socialContainer}>
                             {/* --- GOOGLE BUTTON --- */}
                             <TouchableOpacity 
                                style={[styles.socialButton, (!request || loading) && { opacity: 0.5 }]}
                                onPress={() => promptAsync()}
                                disabled={!request || loading}
                            >
                                <Image style={styles.socialIcon} source={{ uri: "https://img.icons8.com/color/48/000000/google-logo.png" }} resizeMode="contain" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-facebook" size={40} color="#1877F2" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.linkContainer}>
                            <Text style={styles.bottomText}>{"Đã có tài khoản? "}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={[styles.bottomText, styles.link, { color: '#46e49aff' }]}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollView: { flexGrow: 1, backgroundColor: '#fff' },
    headerBackground: { width: '100%', height: 280, alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: 180, overflow: 'hidden' },
    headerTitle: { fontFamily: 'LilitaOne-Regular', fontSize: 60, color: '#fff', marginTop: 50 },
    formContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 33, paddingTop: 15, paddingBottom: 40 },
    title: { fontFamily: 'Inter-Bold', fontSize: 35, color: '#000', marginBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', borderRadius: 30, width: '100%', height: 49, marginBottom: 19, paddingHorizontal: 19 },
    icon: { marginRight: 10 },
    input: { flex: 1, height: '100%', fontFamily: 'Inter-Regular', fontSize: 18, color: '#000' },
    button: { backgroundColor: "#2F847C", borderRadius: 20, paddingVertical: 13, width: '100%', alignItems: 'center', elevation: 5, marginTop: 10, marginBottom: 20 },
    buttonText: { color: "#FFFFFF", fontSize: 25, fontFamily: 'Inter-Bold' },
    orText: { fontFamily: 'Inter-Bold', fontSize: 15, color: '#000', textDecorationLine: 'underline', marginBottom: 20 },
    socialContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 20, alignItems: 'center' },
    socialButton: { marginHorizontal: 20, padding: 10 },
    socialIcon: { width: 40, height: 40 },
    linkContainer: { flexDirection: 'row' },
    bottomText: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#000' },
    link: { fontFamily: 'Inter-Bold', textDecorationLine: 'underline' },
});