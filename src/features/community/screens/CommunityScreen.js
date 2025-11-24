// src/screens/CommunityScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // Thêm TouchableOpacity
import SearchHeader from '../../../components/SearchHeader';
import { Ionicons } from '@expo/vector-icons'; // Import Icon

const CommunityScreen = ({ navigation }) => { // Nhận prop navigation
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <View style={styles.container}>
            <SearchHeader 
                onSearchChange={(text) => setSearchTerm(text)}
                onFilterPress={() => alert('Đã nhấn nút Lọc!')}
            />

            <View style={styles.content}>
                {/* === NÚT BẤM VÀO CHỨC NĂNG PHÂN LOẠI RÁC === */}
                <TouchableOpacity 
                    style={styles.featureBox}
                    onPress={() => navigation.navigate('WasteClassification')}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="trash-bin-outline" size={40} color="#fff" />
                    </View>
                    <Text style={styles.featureText}>Phân loại rác</Text>
                </TouchableOpacity>

                <Text style={styles.searchText}>Bạn đang tìm kiếm: "{searchTerm}"</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 50, // Đẩy nội dung xuống một chút
    },
    // Style cho nút bấm hình vuông
    featureBox: {
        width: 150,
        height: 150,
        backgroundColor: '#4CAF50', // Màu xanh lá
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 5, // Bóng đổ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        marginBottom: 10,
    },
    featureText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        textAlign: 'center',
    },
    searchText: {
        fontSize: 16,
        color: '#555',
    }
});

export default CommunityScreen;