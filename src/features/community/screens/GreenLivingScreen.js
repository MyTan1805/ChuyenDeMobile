// src/features/community/screens/GreenLivingScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Dimensions, ImageBackground, ScrollView
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import CommunityPostCard from '@/features/community/components/CommunityPostCard';
import { useCommunityStore } from '@/store/communityStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- DỮ LIỆU MẪU (GIỮ NGUYÊN) ---
const MOCK_TIPS_DATA = [
    {
        id: '1',
        title: 'Hạn chế nhựa dùng một lần',
        description: 'Giảm thiểu chai nhựa, túi nilon, ống hút nhựa bằng cách sử dụng các sản phẩm tái sử dụng.',
        image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format&fit=crop',
        tagName: 'Giảm rác thải'
    },
    {
        id: '2',
        title: 'Phân loại rác tại nguồn',
        description: 'Tách rác hữu cơ, vô cơ và tái chế để xử lý hiệu quả hơn.',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop',
        tagName: 'Rác thải'
    },
    {
        id: '3',
        title: 'Tiết kiệm nước sinh hoạt',
        description: 'Tắt vòi nước khi đánh răng hoặc rửa chén để tránh lãng phí.',
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=2070&auto=format&fit=crop',
        tagName: 'Tiết kiệm nước'
    },
    {
        id: '4',
        title: 'Tận dụng ánh sáng tự nhiên',
        description: 'Mở cửa sổ vào ban ngày để đón ánh sáng mặt trời.',
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop',
        tagName: 'Năng lượng'
    },
];

const GreenLivingScreen = () => {
    const navigation = useNavigation();
    const { posts, fetchPosts, loading: loadingPosts } = useCommunityStore();
    const [displayTips] = useState(MOCK_TIPS_DATA);

    // Lọc bài viết cộng đồng
    const communityTips = posts.filter(p =>
        (p.type === 'tip' || p.isGreenLiving === true || p.groupName === 'Sống Xanh')
        && !p.isHidden
    );

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    // --- RENDERERS MỚI THEO THIẾT KẾ ---

    // 1. Banner "Góc Sống Xanh" (Màu xanh ngọc nhạt)
    const renderNewBanner = () => (
        <View style={styles.newBannerContainer}>
            <View style={styles.newBannerContent}>
                <Text style={styles.newBannerTitle}>Góc Sống Xanh 🌱</Text>
                <Text style={styles.newBannerSubtitle}>Kiến thức & Mẹo hay mỗi ngày</Text>
            </View>
            <Ionicons name="leaf-outline" size={48} color="#2F847C" style={{ opacity: 0.8 }} />
        </View>
    );

    // 2. Card Mẹo Sống Xanh (Lướt ngang, chữ đè ảnh)
    const renderHorizontalTipCard = ({ item }) => (
        <TouchableOpacity
            style={styles.hCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
        >
            <ImageBackground
                source={{ uri: item.image }}
                style={styles.hCardImage}
                imageStyle={{ borderRadius: 12 }}
            >
                {/* Lớp phủ đen mờ để đọc chữ */}
                <View style={styles.hCardOverlay}>
                    <Text style={styles.hCardTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.hCardTag}>{item.tagName}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    // --- HEADER TỔNG HỢP ---
    const ListHeader = () => (
        <View style={styles.headerContainer}>
            {/* 1. Banner mới */}
            {renderNewBanner()}

            {/* 2. Tiêu đề Section Mẹo (Có nút Xem tất cả) */}
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Mẹo sống xanh</Text>
                <TouchableOpacity onPress={() => navigation.navigate('GreenTipsListScreen')}>
                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            {/* 3. Danh sách lướt ngang (Horizontal List) */}
            <FlatList
                horizontal
                data={displayTips}
                renderItem={renderHorizontalTipCard}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hListContent}
            />

            {/* 4. Tiêu đề Cộng đồng */}
            <View style={styles.communitySectionHeader}>
                <Text style={styles.sectionTitle}>Cộng đồng chia sẻ</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Sống Xanh" showBackButton={true} />

            <FlatList
                data={communityTips}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <CommunityPostCard post={item} />}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    loadingPosts ? <ActivityIndicator size="large" color="#2F847C" style={{ marginTop: 20 }} /> :
                        <Text style={styles.emptyText}>Chưa có bài viết cộng đồng nào.</Text>
                }
            />

            {/* FAB Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Đăng tin', { isTip: true, privacy: 'public' })}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' }, // Nền trắng sạch
    listContent: { paddingBottom: 80 },
    headerContainer: { paddingTop: 16 },

    // --- 1. Styles Banner Mới ---
    newBannerContainer: {
        marginHorizontal: 16,
        backgroundColor: '#E0F2F1', // Màu xanh ngọc rất nhạt (giống hình)
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    newBannerContent: { flex: 1 },
    newBannerTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 20,
        color: '#00695C', // Xanh đậm hơn cho chữ
        marginBottom: 4,
    },
    newBannerSubtitle: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: '#004D40',
    },

    // --- 2. Styles Section Header ---
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        color: '#333',
    },
    viewAllText: {
        fontSize: 14,
        fontFamily: 'Nunito-SemiBold',
        color: '#2F847C', // Màu xanh chủ đạo
    },

    // --- 3. Styles Horizontal Card ---
    hListContent: {
        paddingHorizontal: 12, // Padding cho list ngang
        marginBottom: 10,
    },
    hCard: {
        width: 160, // Chiều rộng cố định cho card ngang
        height: 200, // Chiều cao chữ nhật đứng
        marginHorizontal: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    hCardImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end', // Đẩy nội dung xuống đáy
    },
    hCardOverlay: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.4)', // Gradient đen mờ
    },
    hCardTitle: {
        color: '#fff',
        fontFamily: 'Nunito-Bold',
        fontSize: 14,
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    hCardTag: {
        color: '#E0F2F1',
        fontSize: 11,
        fontFamily: 'Nunito-Regular',
    },

    // --- 4. Styles Khác ---
    communitySectionHeader: {
        paddingHorizontal: 16,
        marginTop: 10,
        paddingTop: 16,
    },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    fab: {
        position: 'absolute', bottom: 30, right: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#2F847C',
        justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }
    }
});

export default GreenLivingScreen;