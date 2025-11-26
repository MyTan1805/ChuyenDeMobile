import React from 'react';
import { View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

// Component Header tái sử dụng
const AuthHeader = () => (
    <ImageBackground
        style={styles.headerBackground}
        source={require('@images/header.jpg')}
        resizeMode="cover"
    >
        <Text style={styles.headerTitle}>ECOMATE</Text>
    </ImageBackground>
);

export default function VerifyEmailScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <AuthHeader />
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Xác nhận Email</Text>

                    <View style={styles.messageBox}>
                        <Text style={styles.messageText}>
                            {"Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến user@mail.com. Vui lòng kiểm tra hộp thư (bao gồm cả Spam/Junk) và làm theo hướng dẫn."}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("NewPassword")}>
                        <Text style={styles.buttonText}>Xác nhận</Text>
                    </TouchableOpacity>

                    <View style={styles.linkContainer}>
                        <Text style={styles.bottomText}>{"Chưa nhận được email? "}</Text>
                        <TouchableOpacity onPress={() => alert("Gửi lại email!")}>
                            <Text style={[styles.bottomText, styles.link, { color: '#46e49aff' }]}>Gửi lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollView: { flexGrow: 1, backgroundColor: '#fff' },
    headerBackground: {
        width: '100%',
        height: 306, // Chiều cao cố định như hình
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomRightRadius: 180, // Tạo hình cong ở góc dưới bên phải
        overflow: 'hidden', // Quan trọng để bo góc hoạt động
    },
    headerTitle: {
        fontFamily: 'LilitaOne-Regular',
        fontSize: 60,
        color: '#fff',
        marginTop: 50,
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 33,
        paddingTop: 15,
        paddingBottom: 40,
    },
    title: {
        fontFamily: 'Inter-Bold',
        fontSize: 35,
        color: '#000',
        marginBottom: 30,
    },
    messageBox: {
        backgroundColor: '#D9D9D9',
        borderRadius: 30,
        width: '100%',
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    messageText: {
        fontFamily: 'Inter-Regular',
        fontSize: 17,
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        backgroundColor: "#2F847C",
        borderRadius: 20,
        paddingVertical: 13,
        width: '100%',
        alignItems: 'center',
        elevation: 5,
        marginBottom: 30,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontFamily: 'Inter-Bold',
    },
    linkContainer: {
        flexDirection: 'row',
    },
    bottomText: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: '#000',
    },
    link: {
        fontFamily: 'Inter-Bold',
        textDecorationLine: 'underline',
    },
});
