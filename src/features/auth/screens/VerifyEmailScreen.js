<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
    View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Alert, AppState, ActivityIndicator
} from 'react-native';
import { useUserStore } from '@/store/userStore';
=======
import React, { useContext } from 'react';
import { View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
>>>>>>> dev/Bao
import { useNavigation, useRoute } from '@react-navigation/native';

const AuthHeader = () => (
    <ImageBackground
        style={styles.headerBackground}
        source={require('@/assets/images/header.jpg')}
        resizeMode="cover"
    >
        <Text style={styles.headerTitle}>ECOMATE</Text>
    </ImageBackground>
);

export default function VerifyEmailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
<<<<<<< HEAD

    const { checkVerificationStatus, sendVerification, resetPassword, logout } = useUserStore();
    const [checking, setChecking] = useState(false);

    const { email, type } = route.params || {};

    // Logic kiểm tra verify
    const handleCheckVerification = async () => {
        setChecking(true);
        const isVerified = await checkVerificationStatus();
        setChecking(false);

        if (isVerified) {
            // Nếu verify thành công, AppNavigator sẽ tự chuyển sang MainStack
            // Không cần navigate thủ công
        } else {
            // Alert.alert("Chưa xác thực", "Vui lòng kiểm tra email và ấn link xác nhận.");
        }
    };

    // Tự động kiểm tra khi app quay lại từ background (sau khi user check mail xong)
    useEffect(() => {
        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === 'active' && type === 'emailVerification') {
                await handleCheckVerification();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

=======
    const { resetPassword, sendVerification, user } = useContext(AuthContext);

    // Nhận params từ màn hình trước
    const { email, type } = route.params || {};

>>>>>>> dev/Bao
    const handleResend = async () => {
        try {
            if (type === 'resetPassword') {
                await resetPassword(email);
<<<<<<< HEAD
                Alert.alert("Đã gửi lại", "Link đặt lại mật khẩu đã được gửi.");
            } else {
                await sendVerification();
                Alert.alert("Đã gửi lại", "Email xác nhận đã được gửi.");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Vui lòng thử lại sau ít phút.");
        }
    };

    const handleLogout = async () => {
        await logout();
        // AppNavigator tự chuyển về màn Login
    };

    const getMessage = () => {
        if (type === 'resetPassword') {
            return `Chúng tôi đã gửi link reset password tới ${email}. Vui lòng kiểm tra.`;
        }
        return `Chúng tôi đã gửi email xác nhận. Vui lòng kiểm tra hộp thư, ấn vào link xác nhận, sau đó quay lại đây.`;
    };

    const isVerifyFlow = type === 'emailVerification';

=======
                Alert.alert("Thành công", "Email đã được gửi lại!");
            } else if (type === 'emailVerification') {
                await sendVerification(user);
                Alert.alert("Thành công", "Email xác nhận đã được gửi lại!");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể gửi lại email. Vui lòng thử lại sau.");
        }
    };

    const getMessage = () => {
        if (type === 'resetPassword') {
            return `Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư, nhấn vào link để đổi mật khẩu, sau đó quay lại đây để đăng nhập.`;
        }
        return `Chúng tôi đã gửi email xác nhận đến ${email}. Vui lòng kiểm tra hộp thư và xác nhận tài khoản của bạn.`;
    };

>>>>>>> dev/Bao
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <AuthHeader />
                <View style={styles.formContainer}>
                    <Text style={styles.title}>
                        {type === 'resetPassword' ? 'Đã gửi Email' : 'Xác nhận Email'}
                    </Text>

                    <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{getMessage()}</Text>
                    </View>

<<<<<<< HEAD
                    {/* Nút xác nhận thủ công (cho trường hợp AppState chưa kịp bắt) */}
                    {isVerifyFlow && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleCheckVerification}
                            disabled={checking}
                        >
                            {checking ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Tôi đã xác nhận</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Nút quay lại / Đăng xuất */}
                    {isVerifyFlow ? (
                        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
                            <Text style={styles.link}>Đăng nhập tài khoản khác</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonText}>Quay lại Đăng nhập</Text>
                        </TouchableOpacity>
                    )}
=======
                    {/* --- SỬA LOGIC NÚT BẤM --- */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Login')} // Luôn quay về Login
                    >
                        <Text style={styles.buttonText}>
                            Quay lại Đăng nhập
                        </Text>
                    </TouchableOpacity>
>>>>>>> dev/Bao

                    <View style={styles.linkContainer}>
                        <Text style={styles.bottomText}>{"Chưa nhận được email? "}</Text>
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={[styles.bottomText, styles.link, { color: '#46e49aff' }]}>Gửi lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollView: { flexGrow: 1, backgroundColor: '#fff' },
    headerBackground: { width: '100%', height: 306, alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: 180, overflow: 'hidden' },
    headerTitle: { fontFamily: 'LilitaOne-Regular', fontSize: 60, color: '#fff', marginTop: 50 },
    formContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 33, paddingTop: 15, paddingBottom: 40 },
    title: { fontFamily: 'Inter-Bold', fontSize: 35, color: '#000', marginBottom: 30 },
    messageBox: { backgroundColor: '#D9D9D9', borderRadius: 30, width: '100%', padding: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
    messageText: { fontFamily: 'Inter-Regular', fontSize: 17, color: '#000', textAlign: 'center', lineHeight: 24 },
    button: { backgroundColor: "#2F847C", borderRadius: 20, paddingVertical: 13, width: '100%', alignItems: 'center', elevation: 5, marginBottom: 30 },
    buttonText: { color: "#FFFFFF", fontSize: 20, fontFamily: 'Inter-Bold' },
<<<<<<< HEAD
    linkContainer: { flexDirection: 'row', marginTop: 10 },
    bottomText: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#000' },
    link: { fontFamily: 'Inter-Bold', textDecorationLine: 'underline', color: '#555' }
});
=======
    linkContainer: { flexDirection: 'row' },
    bottomText: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#000' },
    link: { fontFamily: 'Inter-Bold', textDecorationLine: 'underline' }
});
>>>>>>> dev/Bao
