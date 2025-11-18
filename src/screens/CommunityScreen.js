import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Import component SearchHeader để sử dụng
import SearchHeader from '../component/SearchHeader';

const CommunityScreen = () => {
    // Thêm một state để lưu lại nội dung tìm kiếm và hiển thị ra màn hình
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <View style={styles.container}>
            {/* Đã thay thế CustomHeader cũ bằng SearchHeader mới ở đây */}
            <SearchHeader 
                onSearchChange={(text) => {
                    // Cập nhật state mỗi khi người dùng gõ chữ
                    setSearchTerm(text);
                    console.log('Nội dung tìm kiếm:', text);
                }}
                onFilterPress={() => alert('Đã nhấn nút Lọc!')}
            />

            {/* Phần nội dung bên dưới để hiển thị kết quả test */}
            <View style={styles.content}>
                <Text style={styles.title}>Màn hình Cộng đồng</Text>
                <Text style={styles.searchText}>Bạn đang tìm kiếm: "{searchTerm}"</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Đổi màu nền cho đồng bộ
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchText: {
        fontSize: 16,
        color: '#555',
    }
});

export default CommunityScreen;