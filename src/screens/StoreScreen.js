// src/screens/StoreScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomHeader from '../component/CustomHeader'; // Vẫn dùng header bình thường
import SearchBar from '../component/SearchBar';     // Import component SearchBar mới

const StoreScreen = () => {
    // State để lưu trữ và quản lý nội dung người dùng nhập vào
    const [searchQuery, setSearchQuery] = useState('');

    return (
        // Dùng SafeAreaView để nội dung không bị che bởi tai thỏ
        <SafeAreaView style={styles.safeArea}>

            <View style={styles.container}>
                {/* Đây là cách gọi component SearchBar */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery} // Cập nhật state mỗi khi gõ
                    placeholder="Tìm kiếm sản phẩm..."
                    style={styles.searchBar} // Thêm style margin cho đẹp
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    searchBar: {
        margin: 16, // Tạo khoảng cách xung quanh thanh tìm kiếm
    },
    content: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
    queryText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#4CAF50',
    }
});

export default StoreScreen;