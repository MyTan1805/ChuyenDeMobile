// src/features/community/screens/CommunityScreen.js

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, StatusBar, Platform, FlatList, Image, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import CommunityPostCard from '../components/CommunityPostCard';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
// 1. Import Group Store
import { useGroupStore } from '@/store/groupStore';

const CATEGORIES = [
    { id: 'waste', title: 'Phân loại\nrác', icon: 'recycle', iconLib: 'MaterialCommunityIcons', screen: 'WasteClassification' },
    { id: 'diy', title: 'Tái chế &\nDIY', icon: 'tools', iconLib: 'Ionicons', screen: null },
    { id: 'green', title: 'Sống xanh', icon: 'leaf', iconLib: 'Ionicons', screen: null },
    { id: 'quiz', title: 'Thử thách', icon: 'game-controller', iconLib: 'Ionicons', screen: 'QuizCollection' },
    { id: 'library', title: 'Thư viện', icon: 'book-outline', iconLib: 'Ionicons', screen: 'EcoLibrary' },
];

const CommunityScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('feed');
    const [dailyTip, setDailyTip] = useState(null);
    const [loadingTip, setLoadingTip] = useState(true);

    const { userProfile } = useUserStore();
    const { getVisiblePosts } = useCommunityStore();

    // 2. Lấy dữ liệu từ Group Store
    const { getMyGroups, getAllGroups } = useGroupStore();
    const myGroups = getMyGroups();
    const allGroups = getAllGroups();

    // 3. Xác định danh sách nhóm cần hiển thị dựa trên Tab
    const displayGroups = activeTab === 'groups' ? myGroups : allGroups;

    const visiblePosts = getVisiblePosts();

    useEffect(() => {
        const tipsRef = ref(database, 'daily_tips');
        const unsubscribe = onValue(tipsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const tipsArray = Object.values(data);
                if (tipsArray.length > 0) {
                    setDailyTip(tipsArray[Math.floor(Math.random() * tipsArray.length)].text);
                } else {
                    setDailyTip("Hãy hành động xanh để bảo vệ môi trường hôm nay!");
                }
            }
            setLoadingTip(false);
        });
        return () => unsubscribe();
    }, []);

    // Dữ liệu giả lập cho danh mục (Giữ nguyên)
    const categories = [
        { 
            id: 'waste', 
            title: 'Phân loại\nrác', 
            icon: 'recycle', 
            iconLib: 'MaterialCommunityIcons',
            screen: 'WasteClassification' 
        },
        { 
            id: 'diy', 
            title: 'Tái chế &\nDIY', 
             icon: 'construct-outline',
            iconLib: 'Ionicons', 
            screen: null 
        },
        { 
            id: 'green', 
            title: 'Sống xanh', 
            icon: 'leaf', 
            iconLib: 'Ionicons',
            screen: null 
        },
        { 
            id: 'quiz', 
            title: 'Thử thách', 
            icon: 'game-controller', 
            iconLib: 'Ionicons',
            screen: 'QuizCollection' 
        },
        { 
            id: 'library', 
            title: 'Thư viện\nKiến thức', 
            icon: 'book-outline', 
            iconLib: 'Ionicons',
            screen: 'EcoLibrary' 
        },
    ];

    // --- 1. HEADER SECTION (Giữ nguyên) ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => { }}><Ionicons name="menu-outline" size={30} color="#333" /></TouchableOpacity>
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#999" />
            </View>
            <TouchableOpacity onPress={() => { }}><Ionicons name="notifications-outline" size={28} color="#000" /></TouchableOpacity>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScrollContent}>
                {CATEGORIES.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.catCard}
                        onPress={() => item.screen ? navigation.navigate(item.screen) : alert('Tính năng đang phát triển')}
                    >
                        <View style={styles.catIconCircle}>
                            {item.iconLib === 'MaterialCommunityIcons' ?
                                <MaterialCommunityIcons name={item.icon} size={28} color="#2F847C" /> :
                                <Ionicons name={item.icon} size={28} color="#2F847C" />
                            }
                        </View>
                        <Text style={styles.catTitle}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'feed' && styles.activeTabBtn]} onPress={() => setActiveTab('feed')}>
                <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Khám phá</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'groups' && styles.activeTabBtn]} onPress={() => setActiveTab('groups')}>
                <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Nhóm của tôi</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCreatePost = () => (
        <View style={styles.createPostBar}>
            <Image
                source={{ uri: userProfile?.photoURL || 'https://i.pravatar.cc/150?img=3' }}
                style={styles.smallAvatar}
            />
            <TouchableOpacity
                style={styles.fakeInput}
                onPress={() => navigation.navigate('Đăng tin', { fromCommunity: true })}
            >
                <Text style={styles.fakeInputText}>Bạn đang nghĩ gì, {userProfile?.displayName?.split(' ').pop()}?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Đăng tin', { fromCommunity: true })}>
                <Ionicons name="images-outline" size={24} color="#2F847C" />
            </TouchableOpacity>
        </View>
    );

    const renderCreateGroupBtn = () => (
        <TouchableOpacity style={styles.createGroupCard} onPress={() => navigation.navigate('CreateGroup')}>
            <View style={styles.createGroupIcon}>
                <Ionicons name="add" size={30} color="white" />
            </View>
            <View>
                <Text style={styles.createGroupTitle}>Tạo nhóm mới</Text>
                <Text style={styles.createGroupSub}>Kết nối cộng đồng địa phương</Text>
            </View>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gợi ý cho hôm nay</Text>
                <View style={styles.tipBox}>
                    <Ionicons name="bulb-outline" size={24} color="#333" style={{ marginRight: 12 }} />
                    {loadingTip ? <ActivityIndicator color="#2F847C" /> : <Text style={styles.tipText}>{dailyTip}</Text>}
                </View>
            </View>

            <View style={styles.quizBanner}>
                <Text style={styles.quizText}>Bạn có phải là một 'Chiến binh môi trường'?</Text>
                <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('QuizCollection')}>
                    <Text style={styles.playButtonText}>Chơi ngay</Text>
                </TouchableOpacity>
            </View>

            {renderCategories()}
            {renderTabs()}
            {activeTab === 'feed' && renderCreatePost()}
            {activeTab === 'groups' && renderCreateGroupBtn()}
        </View>
    );

    // 4. Cập nhật renderGroupItem để điều hướng
    const renderGroupItem = ({ item }) => (
        <TouchableOpacity
            style={styles.groupCard}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.image }} style={styles.groupCover} />
            <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupMember}>{item.members} thành viên • {item.location}</Text>
                <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinBtnText}>Tham gia</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}

            <FlatList
                // 5. Sử dụng displayGroups thay cho MOCK_GROUPS
                data={activeTab === 'feed' ? visiblePosts : displayGroups}
                keyExtractor={item => item.id}
                renderItem={activeTab === 'feed'
                    ? ({ item }) => <CommunityPostCard post={item} />
                    : renderGroupItem
                }
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                // Thêm ListEmptyComponent nếu chưa có
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                        {activeTab === 'feed' ? 'Chưa có bài viết nào.' : 'Chưa có nhóm nào.'}
                    </Text>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F9FC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 10, height: 40, marginHorizontal: 12 },
    searchInput: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333' },

    listContent: { padding: 16, paddingBottom: 80 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#000', marginBottom: 12 },

    tipBox: { backgroundColor: '#F0F4C3', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#8BC34A' },
    tipText: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 14, color: '#333', lineHeight: 20 },

    quizBanner: { backgroundColor: '#7B61FF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 25 },
    quizText: { fontFamily: 'Nunito-Bold', fontSize: 18, textAlign: 'center', color: '#fff', marginBottom: 12 },
    playButton: { backgroundColor: '#FFEB3B', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 12 },
    playButtonText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },

    catScrollContent: { paddingRight: 10 },
    catCard: { backgroundColor: '#fff', width: 90, height: 100, borderRadius: 16, marginRight: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    catIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    catTitle: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#333', textAlign: 'center' },

    tabContainer: { flexDirection: 'row', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    tabBtn: { marginRight: 20, paddingBottom: 8 },
    activeTabBtn: { borderBottomWidth: 3, borderBottomColor: '#2F847C' },
    tabText: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#999' },
    activeTabText: { color: '#2F847C' },

    createPostBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 20, elevation: 2 },
    smallAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    fakeInput: { flex: 1, height: 36, justifyContent: 'center' },
    fakeInputText: { color: '#999', fontFamily: 'Nunito-Regular' },

    createGroupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20, elevation: 2 },
    createGroupIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2F847C', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    createGroupTitle: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#333' },
    createGroupSub: { fontSize: 13, color: '#666', fontFamily: 'Nunito-Regular' },

    groupCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 3 },
    groupCover: { width: '100%', height: 120 },
    groupInfo: { padding: 12 },
    groupName: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#333' },
    groupMember: { fontSize: 12, color: '#666', marginTop: 4, fontFamily: 'Nunito-Regular' },
    joinBtn: { backgroundColor: '#E0F2F1', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    joinBtnText: { color: '#00796B', fontFamily: 'Nunito-Bold', fontSize: 14 }
});

export default CommunityScreen;