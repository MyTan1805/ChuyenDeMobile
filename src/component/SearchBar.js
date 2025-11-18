// src/component/SearchBar.js

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText, placeholder = "Tìm kiếm...", style }) => {
    // Hàm để xóa nội dung trong ô tìm kiếm
    const handleClear = () => {
        onChangeText('');
    };

    return (
        <View style={[styles.container, style]}>
            {/* Icon tìm kiếm bên trái */}
            <Ionicons name="search-outline" size={22} color="#888" style={styles.icon} />

            {/* Ô nhập liệu */}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChangeText}
            />

            {/* Nút 'x' để xóa, chỉ hiện khi có chữ */}
            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                    <Ionicons name="close-circle" size={22} color="#888" style={styles.icon} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f1f5', // Màu nền xám nhạt
        borderRadius: 12,
        height: 45,
        paddingHorizontal: 12,
    },
    icon: {
        marginHorizontal: 5,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333',
    },
});

export default SearchBar;