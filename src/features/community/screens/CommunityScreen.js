// src/features/community/screens/CommunityScreen.js

import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, StatusBar, Platform, FlatList, Image, ScrollView, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';

import CommunityPostCard from '../components/CommunityPostCard';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
import { useGroupStore } from '@/store/groupStore';

const { width } = Dimensions.get('window');

const THEME = {
    primary: '#2F847C',
    darkGreen: '#1A4D2E',
    gold: '#D4A373',
    bg: '#F9FAFB',
    textMain: '#2D3436',
    textSub: '#636E72',
    shadow: {
        shadowColor: "#2F847C",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6
    }
};

const CATEGORIES = [
    { id: 'diy', title: 'Tái chế &\nDIY', icon: 'tools', iconLib: 'Ionicons', screen: 'RecycleDIY' },
    { id: 'quiz', title: 'Thử thách', icon: 'game-controller', iconLib: 'Ionicons', screen: 'QuizCollection' },
    { id: 'waste', title: 'Phân Loại', subtitle: 'Rác thải', icon: 'recycle', iconLib: 'MaterialCommunityIcons', screen: 'WasteClassification', color: '#E8F5E9' },
    { id: 'library', title: 'Thư Viện', subtitle: 'Kiến thức', icon: 'book-open-page-variant', iconLib: 'MaterialCommunityIcons', screen: 'EcoLibrary', color: '#E3F2FD' },
    { id: 'quiz', title: 'Thử Thách', subtitle: 'Đố vui', icon: 'brain', iconLib: 'MaterialCommunityIcons', screen: 'QuizCollection', color: '#FFF3E0' },
    { id: 'green', title: 'Sống Xanh', subtitle: 'Lifestyle', icon: 'leaf', iconLib: 'Ionicons', screen: null, color: '#F3E5F5' },
];

const CommunityScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('feed');
    const [dailyTip, setDailyTip] = useState(null);
    const [loadingTip, setLoadingTip] = useState(true);

    const { fetchGroups, allGroups } = useGroupStore();
    const { userProfile } = useUserStore();
    const { fetchPosts, posts, hiddenPosts } = useCommunityStore();

    // ✅ FIX 5: Lọc bài viết cẩn thận hơn để tránh crash list
    const visiblePosts = useMemo(() => {
        return posts.filter(p => p && p.id && !hiddenPosts.includes(p.id));
    }, [posts, hiddenPosts]);

    const displayGroups = allGroups;

    useEffect(() => {
        const unsubPosts = fetchPosts();
        const unsubGroups = fetchGroups();

        return () => {
            if (typeof unsubPosts === 'function') unsubPosts();
            if (typeof unsubGroups === 'function') unsubGroups();
        };
    }, []);

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

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
                <View>
                    <Text style={styles.headerGreeting}>Chào bạn,</Text>
                    <Text style={styles.headerUsername} numberOfLines={1}>
                        {userProfile?.displayName || 'Thành viên mới'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.notiBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={THEME.primary} />
                    <View style={styles.notiBadge} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={THEME.textSub} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm bài viết, nhóm..."
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );

    const renderDailyTip = () => (
        <View style={styles.section}>
            <LinearGradient
                colors={[THEME.primary, THEME.darkGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipGradient}
            >
                <View style={styles.tipHeaderRow}>
                    <View style={styles.tipIconBg}>
                        <FontAwesome5 name="lightbulb" size={14} color={THEME.gold} />
                    </View>
                    <Text style={styles.tipTitle}>THÔNG ĐIỆP HÔM NAY</Text>
                </View>
                {loadingTip ? (
                    <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
                ) : (
                    <Text style={styles.tipText}>"{dailyTip}"</Text>
                )}
                <Ionicons name="leaf" size={100} color="rgba(255,255,255,0.1)" style={styles.tipDecorImage} />
            </LinearGradient>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.sectionNoMargin}>
            <Text style={styles.sectionTitle}>Khám Phá</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catScrollContent}
            >
                {CATEGORIES.map((item, index) => {
                    const IconComp = item.iconLib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.catCard}
                            onPress={() => item.screen ? navigation.navigate(item.screen) : alert('Tính năng đang phát triển')}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.catIconContainer, { backgroundColor: item.color }]}>
                                <IconComp name={item.icon} size={26} color={THEME.primary} />
                            </View>
                            <Text style={styles.catTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabSection}>
            <View style={styles.tabPillContainer}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'feed' && styles.activeTabBtn]}
                    onPress={() => setActiveTab('feed')}
                >
                    <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Bảng Tin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'groups' && styles.activeTabBtn]}
                    onPress={() => setActiveTab('groups')}
                >
                    <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Cộng Đồng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCreatePost = () => (
        <TouchableOpacity
            style={styles.createPostBar}
            onPress={() => navigation.navigate('Đăng tin', { fromCommunity: true })}
            activeOpacity={0.9}
        >
            <View style={styles.createPostLeft}>
                {userProfile?.photoURL ? (
                    <Image source={{ uri: userProfile.photoURL }} style={styles.smallAvatar} />
                ) : (
                    <View style={[styles.smallAvatar, styles.defaultAvatar]}>
                        <Ionicons name="person" size={18} color="#fff" />
                    </View>
                )}
                <Text style={styles.fakeInputText}>Chia sẻ khoảnh khắc xanh...</Text>
            </View>
            <Ionicons name="images-outline" size={22} color={THEME.primary} />
        </TouchableOpacity>
    );

    const renderCreateGroupBtn = () => (
        <TouchableOpacity
            style={styles.createGroupCard}
            onPress={() => navigation.navigate('CreateGroup')}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={[THEME.primary, '#4DB6AC']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.createGroupGradient}
            >
                <View style={styles.createGroupContent}>
                    <View style={styles.plusIconCircle}>
                        <Ionicons name="add" size={24} color={THEME.primary} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.createGroupTitle}>Tạo Nhóm Mới</Text>
                        <Text style={styles.createGroupSub}>Kết nối cộng đồng địa phương</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" style={{ opacity: 0.8 }} />
            </LinearGradient>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View style={styles.headerWrapper}>
            {renderHeader()}
            {renderDailyTip()}
            {renderCategories()}
            {renderTabs()}
            <View style={styles.actionSection}>
                {activeTab === 'feed' ? renderCreatePost() : renderCreateGroupBtn()}
            </View>
        </View>
    );

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity
            style={styles.groupCard}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
            activeOpacity={0.95}
        >
            <Image source={{ uri: item.image || 'https://via.placeholder.com/500' }} style={styles.groupCover} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.groupOverlay}
            >
                <View style={styles.groupInfoContainer}>
                    <View style={styles.groupBadge}>
                        <Ionicons name="location-sharp" size={10} color="#fff" />
                        <Text style={styles.groupBadgeText}>{item.city || 'Toàn quốc'}</Text>
                    </View>
                    <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.groupMemberText}>{item.members} thành viên • {item.posts?.length || 0} bài viết</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={activeTab === 'feed' ? visiblePosts : displayGroups}
                    keyExtractor={item => item.id}
                    renderItem={activeTab === 'feed'
                        ? ({ item }) => <View style={{ marginBottom: 16, paddingHorizontal: 20 }}><CommunityPostCard post={item} /></View>
                        : renderGroupItem
                    }
                    ListHeaderComponent={ListHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="leaf-off" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {activeTab === 'feed' ? 'Chưa có bài viết nào.' : 'Chưa có nhóm nào.'}
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    listContent: {
        paddingBottom: 80
    },
    headerWrapper: {
        marginBottom: 10
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        marginBottom: 20,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerGreeting: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: THEME.textSub,
    },
    headerUsername: {
        fontFamily: 'Nunito-Bold',
        fontSize: 24,
        color: THEME.textMain,
    },
    notiBtn: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        ...THEME.shadow
    },
    notiBadge: {
        position: 'absolute',
        top: 10, right: 10,
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        borderWidth: 1,
        borderColor: '#fff'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...THEME.shadow
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        fontFamily: 'Nunito-Regular',
        fontSize: 15,
        color: THEME.textMain
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionNoMargin: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 18,
        color: THEME.textMain,
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    tipGradient: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        ...THEME.shadow,
        shadowColor: THEME.darkGreen,
        shadowOpacity: 0.25,
        minHeight: 140,
        justifyContent: 'center'
    },
    tipHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    tipIconBg: {
        width: 24, height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 8
    },
    tipTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 11,
        color: THEME.gold,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    tipText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 18,
        color: '#fff',
        lineHeight: 26,
        fontStyle: 'italic',
        zIndex: 2,
        paddingRight: 20
    },
    tipDecorImage: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        opacity: 0.15,
        transform: [{ rotate: '-15deg' }]
    },
    catScrollContent: {
        paddingHorizontal: 40,
        paddingRight: 10
    },
    catCard: {
        alignItems: 'center',
        marginRight: 20,
    },
    catIconContainer: {
        width: 64, height: 64,
        borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 8,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2
    },
    catTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 13,
        color: THEME.textMain
    },
    tabSection: {
        paddingHorizontal: 20,
        marginBottom: 20
    },
    tabPillContainer: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderRadius: 25,
        padding: 4,
        height: 50
    },
    tabBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    activeTabBtn: {
        backgroundColor: '#fff',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
    },
    tabText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 14,
        color: '#888'
    },
    activeTabText: {
        color: THEME.primary,
        fontSize: 15,
    },
    actionSection: {
        paddingHorizontal: 20,
        marginBottom: 10
    },
    createPostBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...THEME.shadow
    },
    createPostLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    smallAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
    defaultAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    fakeInputText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: '#999'
    },
    createGroupCard: {
        borderRadius: 18,
        overflow: 'hidden',
        ...THEME.shadow
    },
    createGroupGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    createGroupContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    plusIconCircle: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center'
    },
    createGroupTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#fff'
    },
    createGroupSub: {
        fontFamily: 'Nunito-Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)'
    },
    groupCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        height: 200,
        overflow: 'hidden',
        ...THEME.shadow
    },
    groupCover: {
        width: '100%',
        height: '100%'
    },
    groupOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 16,
    },
    groupName: {
        fontFamily: 'Nunito-Bold',
        fontSize: 20,
        color: '#fff',
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4
    },
    groupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8
    },
    groupBadgeText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 10,
        color: '#fff',
        marginLeft: 4,
        textTransform: 'uppercase'
    },
    groupMemberText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)'
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: '#999',
        marginTop: 10
    }
});

export default CommunityScreen;