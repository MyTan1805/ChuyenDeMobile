import React, { useState } from 'react';
import { View, ImageBackground, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';

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
        />
    </View>
);

const AuthHeader = () => (
    <ImageBackground
        style={styles.headerBackground}
        source={require('@/assets/images/header.jpg')}
        resizeMode="cover"
    >
        <Text style={styles.headerTitle}>ECOMATE</Text>
    </ImageBackground>
);

export default function NewPasswordScreen({ navigation }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const passwordIcon = (
        <Svg width="16" height="21" viewBox="0 0 16 21" fill="none">
            <Path d="M8 16C8.53043 16 9.03914 15.7893 9.41421 15.4142C9.78929 15.0391 10 14.5304 10 14C10 13.4696 9.78929 12.9609 9.41421 12.5858C9.03914 12.2107 8.53043 12 8 12C7.46957 12 6.96086 12.2107 6.58579 12.5858C6.21071 12.9609 6 13.4696 6 14C6 14.5304 6.21071 15.0391 6.58579 15.4142C6.96086 15.7893 7.46957 16 8 16ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 8.46957 0.210714 7.96086 0.585786 7.58579C0.960859 7.21071 1.46957 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="black" />
        </Svg>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <AuthHeader />
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Mật khẩu mới</Text>

                    <CustomTextInput
                        placeholder="Nhập mật khẩu mới"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={passwordIcon}
                    />

                    <CustomTextInput
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        icon={passwordIcon}
                    />

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.buttonText}>Xác nhận</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={[styles.bottomText, styles.link, { color: '#67D4F0' }]}>Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollView: { flexGrow: 1, backgroundColor: '#fff' },
    headerBackground: {
        width: '100%',
        height: 306, 
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomRightRadius: 180, 
        overflow: 'hidden',  
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
