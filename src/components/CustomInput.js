// src/component/CustomInput.js

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({
    iconName,       // Tên của icon từ Ionicons (ví dụ: 'mail-outline')
    placeholder,    // Chữ gợi ý
    value,          // Giá trị của input (do component cha quản lý)
    onChangeText,   // Hàm được gọi khi text thay đổi
    secureTextEntry = false, // Đặt là true cho ô mật khẩu
    style,          // Style tùy chỉnh từ bên ngoài
    ...rest         // Các props khác của TextInput (ví dụ: keyboardType)
}) => {
    return (
        <View style={[styles.container, style]}>
            <Ionicons name={iconName} size={22} color="#888" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                {...rest} // Truyền các props còn lại vào TextInput
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 55,
        backgroundColor: '#f0f1f5', // Màu nền xám nhạt
        borderRadius: 30, // Bo tròn nhiều để tạo hình viên thuốc
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1, // Chiếm hết không gian còn lại
        height: '100%',
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#333',
    },
});

export default CustomInput;