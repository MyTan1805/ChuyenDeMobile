import React, { useState } from 'react';
import { View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';

// Component Input tái sử dụng
const CustomTextInput = ({ placeholder, icon, value, onChangeText }) => (
    <View style={styles.inputContainer}>
        <View style={styles.icon}>{icon}</View>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#888"
            value={value}
            onChangeText={onChangeText}
            keyboardType="email-address"
        />
    </View>
);

// Component Header tái sử dụng
const AuthHeader = () => (
    <ImageBackground
        style={styles.headerBackground}
        source={require('../../assets/header.jpg')}
        resizeMode="cover"
    >
        <Text style={styles.headerTitle}>ECOMATE</Text>
    </ImageBackground>
);

// Component Nút Quay Lại
const BackButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path d="M12.5 16.6667L5.83333 10L12.5 3.33333" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </Svg>
        <Text style={styles.backButtonText}>Quay lại Đăng nhập</Text>
    </TouchableOpacity>
);

export default function ForgetPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <AuthHeader />
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Quên mật khẩu</Text>

                    <CustomTextInput
                        placeholder="Nhập email"
                        value={email}
                        onChangeText={setEmail}
                        icon={<Svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                            <Path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" fill="black" />
                        </Svg>}
                    />

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("VerifyEmail")}>
                        <Text style={styles.buttonText}>Gửi email</Text>
                    </TouchableOpacity>

                    <BackButton onPress={() => navigation.goBack()} />
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        borderRadius: 30,
        width: '100%',
        height: 49,
        marginBottom: 19,
        paddingHorizontal: 19,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: 'Inter-Regular',
        fontSize: 18,
        color: '#000',
    },
    button: {
        backgroundColor: "#2F847C",
        borderRadius: 20,
        paddingVertical: 13,
        width: '100%',
        alignItems: 'center',
        elevation: 5,
        marginTop: 10,
        marginBottom: 30,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 20,
        fontFamily: 'Inter-Bold',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    backButtonText: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: '#000',
        marginLeft: 8,
    }
});
