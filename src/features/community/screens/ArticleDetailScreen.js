// src/features/community/screens/ArticleDetailScreen.js

import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ArticleDetailScreen = ({ route }) => {
    // Lấy dữ liệu bài viết được truyền sang từ màn hình trước
    const { article } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader title="Chi tiết bài viết" showBackButton={true} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Ảnh bìa */}
                <Image 
                    source={{ uri: article.image }} 
                    style={styles.heroImage} 
                    resizeMode="cover"
                />

                <View style={styles.contentContainer}>
                    {/* Thông tin metadata */}
                    <View style={styles.metaRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>KIẾN THỨC</Text>
                        </View>
                        <View style={styles.dateContainer}>
                            <Ionicons name="time-outline" size={14} color="#888" />
                            <Text style={styles.dateText}> {article.readTime} đọc • {article.date}</Text>
                        </View>
                    </View>

                    {/* Tiêu đề */}
                    <Text style={styles.title}>{article.title}</Text>

                    {/* Tóm tắt (In nghiêng) */}
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryText}>{article.summary}</Text>
                    </View>

                    {/* Nội dung chính */}
                    <Text style={styles.contentText}>
                        {article.content || "Nội dung đang được cập nhật..."}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 40 },
    
    heroImage: {
        width: '100%',
        height: 250,
    },
    contentContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -25, // Kéo phần nội dung đè lên ảnh một chút
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    tag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
    },
    tagText: {
        color: '#2E7D32',
        fontSize: 12,
        fontFamily: 'Nunito-Bold',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: '#888',
        fontSize: 13,
        fontFamily: 'Nunito-Regular',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginBottom: 15,
        lineHeight: 32,
    },
    summaryBox: {
        borderLeftWidth: 4,
        borderLeftColor: '#2F847C',
        paddingLeft: 12,
        marginBottom: 20,
        backgroundColor: '#F9F9F9',
        paddingVertical: 10,
    },
    summaryText: {
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#555',
        fontStyle: 'italic',
        lineHeight: 24,
    },
    contentText: {
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#333',
        lineHeight: 28, // Giãn dòng rộng để dễ đọc
        textAlign: 'justify', // Căn đều 2 bên
    },
});

export default ArticleDetailScreen;