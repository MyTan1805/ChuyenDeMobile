import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useUserStore } from '@/store/userStore';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import Badges
import { BADGE_TIERS, getCurrentBadgeStatus } from '@/constants/badges'; 

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, userProfile, logout, fetchUserProfile } = useUserStore();

    useEffect(() => {
        if (user?.uid) fetchUserProfile(user.uid);
    }, [user]);

    // Thêm highScore vào defaultStats
    const defaultStats = {
        points: 0, 
        highScore: 0, // <-- Có trường này
        sentReports: 0, trashSorted: 0, community: 0, levelProgress: 0,
        communityStats: [
            { label: 'T1', report: 0, recycle: 0 },
            { label: 'T2', report: 0, recycle: 0 },
            { label: 'T3', report: 0, recycle: 0 },
            { label: 'T4', report: 0, recycle: 0 },
            { label: 'T5', report: 0, recycle: 0 },
        ]
    };

    if (!userProfile) {
         return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2F847C" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải hồ sơ...</Text>
            </View>
        );
    }

    const displayData = userProfile;
    const stats = displayData.stats || defaultStats;
    const chartData = stats.communityStats || defaultStats.communityStats;
    
    // SỬ DỤNG ĐIỂM CAO NHẤT (highScore) ĐỂ XÁC ĐỊNH HUY HIỆU
    const badgeStatus = getCurrentBadgeStatus(stats.highScore); 

    const renderStatItem = (item) => {
        const isUnlocked = item.unlocked;

        return (
            <View style={styles.statIconItem}>
                <View style={[
                    styles.iconCircle, 
                    { backgroundColor: isUnlocked ? item.color + '20' : '#F0F0F0' } 
                ]}>
                    <FontAwesome5 
                        name={item.icon} 
                        size={20} 
                        color={isUnlocked ? item.color : '#C0C0C0'} 
                    />
                </View>
                
                <View style={styles.badgeTextWrapper}>
                    <Text style={[styles.statLabel, !isUnlocked && {color: '#999'}]}>{item.name}</Text>
                    {!isUnlocked ? (
                        <Text style={styles.thresholdText}>Đạt {item.threshold}đ</Text>
                    ) : (
                         <Text style={styles.thresholdTextSuccess}>Đã đạt</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderCommunityChart = () => {
        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartRow}>
                    {chartData.map((item, index) => {
                        const reportHeight = item.report === 0 ? 4 : item.report;
                        const recycleHeight = item.recycle === 0 ? 4 : item.recycle;
                        const reportColor = item.report === 0 ? '#E1F5FE' : '#4FC3F7';
                        const recycleColor = item.recycle === 0 ? '#E0F2F1' : '#2F847C';

                        return (
                            <View key={index} style={styles.chartCol}>
                                <View style={styles.barsGroup}>
                                    <View style={[styles.bar, { height: reportHeight, backgroundColor: reportColor }]} />
                                    <View style={[styles.bar, { height: recycleHeight, backgroundColor: recycleColor }]} />
                                </View>
                                <Text style={styles.chartLabel}>{item.label}</Text>
                            </View>
                        )
                    })}
                </View>
                <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#4FC3F7' }]} />
                        <Text style={styles.legendText}>Báo vi phạm</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#2F847C' }]} />
                        <Text style={styles.legendText}>Tái chế (lần)</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader
                title="Trang Cá Nhân"
                showNotificationButton={true}
                showSettingsButton={true}
                onSettingsPress={() => navigation.navigate('Settings')}
                onNotificationPress={() => navigation.navigate('NotificationList')}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Header Info Card */}
                <View style={styles.card}>
                    <View style={styles.userInfoHeader}>
                        <View style={styles.avatarWrapper}>
                            {displayData.photoURL ? (
                                <Image source={{ uri: displayData.photoURL }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder} />
                            )}
                            <TouchableOpacity style={styles.editIconBadge} onPress={() => navigation.navigate('EditProfile')}>
                                <Ionicons name="pencil" size={12} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.userInfoText}>
                            <Text style={styles.userName}>{displayData.displayName || "Người dùng"}</Text>

                            {stats.points > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>Thành viên tích cực</Text>
                                </View>
                            )}

                            <Text style={styles.subText} numberOfLines={1}>
                                <Ionicons name="location-outline" size={12} /> {displayData.location || "Chưa cập nhật"}
                            </Text>
                            <Text style={styles.joinDate}>
                                {displayData.createdAt
                                    ? `Thành viên từ ${new Date(displayData.createdAt).toLocaleDateString('vi-VN')}`
                                    : "Thành viên mới"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. Thành tích */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="trophy" size={20} color="#FFD700" />
                        <Text style={styles.cardTitle}>Thành tích</Text>
                    </View>

                    <View style={styles.pointsWrapper}>
                        {/* HIỂN THỊ ĐIỂM HIỆN TẠI (Dùng để đổi quà) */}
                        <Text style={styles.pointsLabel}>Điểm hiện tại:</Text>
                        <Text style={styles.pointsValue}>{stats.points}</Text>

                        {/* HIỂN THỊ ĐIỂM CAO NHẤT (Dùng cho danh hiệu) */}
                        <Text style={styles.highScoreText}>
                             Điểm cao nhất: {stats.highScore}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        {badgeStatus.map((badge, index) => (
                            <View key={index} style={{ flex: 1 }}>
                                {renderStatItem(badge)}
                            </View>
                        ))}
                    </View>
                </View>

                {/* 3. Thống kê cá nhân */}
                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cá nhân</Text>

                    <View style={styles.statRowItem}>
                        <Text style={styles.statRowLabel}>Báo cáo đã gửi</Text>
                        <Text style={styles.statRowValue}>{stats.sentReports}</Text>
                    </View>
                    <View style={styles.separator} />

                    <View style={styles.statRowItem}>
                        <Text style={styles.statRowLabel}>Lần phân loại rác</Text>
                        <Text style={styles.statRowValue}>{stats.trashSorted}</Text>
                    </View>
                    <View style={styles.separator} />

                    <View style={styles.statRowItem}>
                        <Text style={styles.statRowLabel}>Tham gia cộng đồng</Text>
                        <Text style={styles.statRowValue}>{stats.community}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Tiến độ cấp độ</Text>
                            <Text style={styles.progressValue}>{Math.floor(stats.levelProgress * 100)}%</Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${stats.levelProgress * 100}%` }]} />
                        </View>
                    </View>
                </View>

                {/* 4. Thống kê cộng đồng */}
                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cộng đồng</Text>
                    <Text style={styles.chartSubtitle}>Hoạt động nhóm 5 tháng gần nhất</Text>
                    {renderCommunityChart()}
                </View>

                {/* 5. Actions */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={styles.secondaryButtonText}>Chỉnh sửa trang cá nhân</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Xuất Báo cáo cá nhân</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Ionicons name="log-out-outline" size={20} color="#FF5252" style={{ marginRight: 8 }} />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    scrollContent: { padding: 16 },

    // Card Style
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },

    // Header Info
    userInfoHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarWrapper: { position: 'relative' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0' },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    editIconBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#2F847C', padding: 6, borderRadius: 12,
        borderWidth: 2, borderColor: 'white'
    },
    userInfoText: { marginLeft: 20, flex: 1 },
    userName: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#333' },
    badgeContainer: {
        backgroundColor: '#E0F2F1', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, alignSelf: 'flex-start', marginTop: 4, marginBottom: 6
    },
    badgeText: { color: '#00796B', fontSize: 12, fontFamily: 'Nunito-Bold' },
    subText: { fontFamily: 'Nunito-Regular', color: '#757575', fontSize: 14 },
    joinDate: { fontFamily: 'Nunito-Regular', color: '#9E9E9E', fontSize: 12, marginTop: 4 },

    // Achievements
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, marginLeft: 8, color: '#333' },
    
    // Points Wrapper được chỉnh lại để chứa 2 dòng điểm
    pointsWrapper: { alignItems: 'center', marginVertical: 10 },
    pointsValue: { fontFamily: 'Nunito-Bold', fontSize: 36, color: '#333' },
    pointsLabel: { fontFamily: 'Nunito-Regular', color: '#757575', fontSize: 14 },
    highScoreText: { fontFamily: 'Nunito-Regular', color: '#FF9800', fontSize: 14, marginTop: 5 }, // Màu cam nổi bật cho High Score
    
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    statIconItem: { alignItems: 'center', flex: 1 }, 
    
    iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    
    badgeTextWrapper: {
        height: 40, 
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
    },

    statLabel: { 
        fontSize: 13, 
        fontFamily: 'Nunito-Bold', 
        color: '#555', 
        textAlign: 'center',
    },
    thresholdText: {
        fontSize: 11,
        fontFamily: 'Nunito-Regular',
        color: '#FF9800',
        marginTop: 2,
    },
    thresholdTextSuccess: {
        fontSize: 11,
        fontFamily: 'Nunito-Regular',
        color: '#4CAF50',
        marginTop: 2,
    },

    // Personal Stats
    cardTitleBold: { fontFamily: 'Nunito-Bold', fontSize: 18, marginBottom: 16, color: '#333' },
    statRowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    statRowLabel: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#555' },
    statRowValue: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    separator: { height: 1, backgroundColor: '#F0F0F0' },

    progressContainer: { marginTop: 15 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#757575' },
    progressValue: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#2F847C' },
    progressBarTrack: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#2F847C', borderRadius: 4 },

    // Chart
    chartSubtitle: { fontFamily: 'Nunito-Regular', color: '#757575', fontSize: 13, marginBottom: 20 },
    chartContainer: { alignItems: 'center' },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 120, alignItems: 'flex-end', paddingHorizontal: 10 },
    chartCol: { alignItems: 'center', width: 40 },
    barsGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    bar: { width: 8, borderRadius: 4 }, // Chiều rộng cột
    chartLabel: { marginTop: 8, fontSize: 12, color: '#757575', fontFamily: 'Nunito-Bold' },
    chartLegend: { flexDirection: 'row', marginTop: 20, gap: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: '#555' },

    // Actions
    actionContainer: { gap: 12 },
    secondaryButton: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
        paddingVertical: 14, borderRadius: 25, alignItems: 'center'
    },
    secondaryButtonText: { fontFamily: 'Nunito-Bold', color: '#333', fontSize: 15 },
    logoutButton: {
        flexDirection: 'row', backgroundColor: '#FFEBEE',
        paddingVertical: 14, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 10
    },
    logoutText: { fontFamily: 'Nunito-Bold', color: '#FF5252', fontSize: 15 },
});

export default ProfileScreen;