// src/features/profile/screens/BadgeCollectionScreen.jsx

import React, { useState, useEffect, useMemo } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ALL_BADGES, BADGE_CATEGORIES, getDetailedBadgeStatus } from '@/constants/badges'; 
import { useUserStore } from '@/store/userStore'; 

const { width } = Dimensions.get('window');

// =======================================================
// COMPONENT BadgeItem (Giữ nguyên)
// =======================================================
const BadgeItem = ({ badge }) => {
    const isUnlocked = badge.unlocked;
    const opacity = isUnlocked ? 1 : 0.6;
    const cardColor = isUnlocked ? '#fff' : '#F0F0F0';
    
    // Lấy ngưỡng điểm và tiến độ
    const displayThreshold = badge.nextThreshold || badge.threshold;
    const currentProgress = badge.currentValue || 0;

    return (
        <View style={[styles.badgeCard, { backgroundColor: cardColor, opacity: opacity }]}>
            <View style={[
                styles.badgeIconContainer, 
                { backgroundColor: isUnlocked ? badge.color + '20' : '#E0E0E0' } 
            ]}>
                <FontAwesome5 name={badge.icon} size={28} color={isUnlocked ? badge.color : '#666'} />
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
            
            <Text style={styles.badgeTier}>
                 {badge.category}
            </Text>
            
            <View style={styles.badgeInfo}>
                {isUnlocked ? (
                    <Text style={styles.unlockedText}>Đã có</Text>
                ) : (
                    <Text style={styles.lockedText}>Yêu cầu {displayThreshold} điểm</Text>
                )}
                 <Text style={styles.badgeProgressText}>
                    {isUnlocked ? `[Kỷ lục: ${currentProgress}]` : `[${currentProgress}/${displayThreshold}]`}
                </Text>
            </View>
        </View>
    );
};
// =======================================================


const BadgeCollectionScreen = ({ route, navigation }) => {
    const userProfile = useUserStore(state => state.userProfile);
    const stats = userProfile?.stats || {};
    const quizResults = userProfile?.quizResults || {};
    
    // SỬ DỤNG useMemo ĐỂ ỔN ĐỊNH allBadges (Tránh lỗi vòng lặp)
    const calculatedBadges = useMemo(() => {
        if (route.params?.detailedBadges && route.params.detailedBadges.length > 0) {
            return route.params.detailedBadges;
        }
        return getDetailedBadgeStatus(stats, quizResults);
    }, [route.params?.detailedBadges, stats.highScore, quizResults]);

    const [activeTab, setActiveTab] = useState('all');
    const [filteredBadges, setFilteredBadges] = useState(calculatedBadges); 
    
    // Reset danh sách khi calculatedBadges thay đổi
    useEffect(() => {
        setActiveTab('all');
        setFilteredBadges(calculatedBadges); 
    }, [calculatedBadges]);
    
    // Lọc danh sách khi Tab hoặc calculatedBadges thay đổi
    useEffect(() => {
        let list = calculatedBadges; 
        if (activeTab === 'achieved') {
            list = calculatedBadges.filter(b => b.unlocked);
        } else if (activeTab === 'locked') {
            list = calculatedBadges.filter(b => !b.unlocked);
        }
        
        setFilteredBadges(list.sort((a, b) => b.unlocked - a.unlocked || a.threshold - b.threshold));
    }, [activeTab, calculatedBadges]); 

    // Logic tính tiến độ thanh bar
    const tierBadges = calculatedBadges.filter(b => b.isTier).sort((a, b) => a.threshold - b.threshold);
    const nextMilestone = calculatedBadges.find(b => stats.highScore < b.threshold) || null;

    let progressValue = 0;
    let progressName = 'Hoàn thành';
    let progressCurrent = stats.highScore;
    let progressTarget = stats.highScore; 

    if (nextMilestone) {
        progressTarget = nextMilestone.threshold;
        progressName = nextMilestone.name;
        
        const allThresholds = ALL_BADGES.map(b => b.threshold).filter(t => t < progressTarget).sort((a, b) => a - b);
        const previousThreshold = allThresholds.pop() || 0;
        
        const range = progressTarget - previousThreshold;
        const progressInRange = stats.highScore - previousThreshold;
        
        progressValue = (progressInRange / range) * 100;
        progressValue = Math.max(0, Math.min(100, progressValue)); 
    }


    const TabButton = ({ id, label }) => (
        <TouchableOpacity 
            style={[styles.tabButton, activeTab === id && styles.activeTabButton]}
            onPress={() => setActiveTab(id)}
        >
            <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader title="Bộ sưu tập Huy hiệu" showBackButton={true} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Thanh tiến độ chi tiết */}
                <View style={styles.progressDetailCard}>
                    <Text style={styles.progressDetailTitle}>Quá trình huy hiệu tiếp theo</Text>
                    <View style={styles.progressBarWrapper}>
                        <View style={[styles.progressBarFillLarge, { width: `${progressValue}%` }]} />
                        <Text style={styles.percentageText}>{Math.floor(progressValue)}%</Text>
                    </View>
                    <Text style={styles.progressDetailInfo}>
                        {progressName} ({progressCurrent}/{progressTarget} điểm)
                    </Text>
                </View>

                {/* Tabs lọc */}
                <View style={styles.tabsContainer}>
                    <TabButton id="all" label={`Tất cả (${calculatedBadges.length})`} />
                    <TabButton id="achieved" label={`Đã có (${calculatedBadges.filter(b => b.unlocked).length})`} />
                    <TabButton id="locked" label={`Khóa (${calculatedBadges.filter(b => !b.unlocked).length})`} />
                </View>

                {/* Grid Huy hiệu */}
                <View style={styles.badgeGrid}>
                    {filteredBadges.length === 0 ? (
                        <Text style={styles.emptyTextFull}>
                            {activeTab === 'achieved' ? "Bạn chưa mở khóa huy hiệu nào." : 
                             activeTab === 'locked' ? "Tuyệt vời, bạn đã mở khóa tất cả!" :
                             "Không tìm thấy huy hiệu nào."
                            }
                        </Text>
                    ) : (
                        filteredBadges.map((badge) => (
                            <BadgeItem key={badge.id} badge={badge} />
                        ))
                    )}
                </View>
                
                {/* XÓA PHẦN HOẠT ĐỘNG GẦN ĐÂY */}
                {/* <Text style={styles.activityTitle}>Hoạt động gần đây</Text>
                <View style={styles.activityBox} />
                <View style={styles.activityBox} />
                <View style={{height: 40}} /> */}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 15 },
    
    // Progress Detail Card
    progressDetailCard: {
        backgroundColor: '#F0F0F0',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center'
    },
    progressDetailTitle: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginBottom: 10
    },
    progressBarWrapper: {
        width: '100%',
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    progressBarFillLarge: {
        height: '100%',
        backgroundColor: '#7B61FF',
    },
    percentageText: {
        position: 'absolute',
        right: 10,
        fontSize: 10,
        fontFamily: 'Nunito-Bold',
        color: 'white',
    },
    progressDetailInfo: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
        color: '#555'
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        marginBottom: 20
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    activeTabButton: {
        backgroundColor: '#333',
        borderColor: '#333',
    },
    tabText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 14,
        color: '#666'
    },
    activeTabText: {
        color: '#fff'
    },

    // Badge Grid
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around', 
    },
    badgeCard: {
        width: (width / 2) - 30, 
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    badgeIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    badgeName: {
        fontFamily: 'Nunito-Bold',
        fontSize: 15,
        color: '#333',
        textAlign: 'center'
    },
    badgeTier: {
        fontFamily: 'Nunito-Regular',
        fontSize: 12,
        color: '#999',
        marginBottom: 5,
    },
    badgeInfo: {
        marginTop: 5,
        alignItems: 'center'
    },
    unlockedText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 13,
        color: '#4CAF50'
    },
    lockedText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 12,
        color: '#FF9800'
    },
    badgeProgressText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 10,
        color: '#777',
        marginTop: 2
    },
    emptyTextFull: {
        textAlign: 'center',
        marginTop: 50,
        width: '100%',
        fontFamily: 'Nunito-Regular',
        color: '#888'
    },

    // XÓA CÁC STYLE MOCK KHÁC
    // activityTitle: {
    //     fontFamily: 'Nunito-Bold',
    //     fontSize: 16,
    //     color: '#333',
    //     marginTop: 10,
    //     marginBottom: 10
    // },
    // activityBox: {
    //     backgroundColor: '#E0E0E0',
    //     height: 50,
    //     borderRadius: 10,
    //     marginBottom: 10
    // }
});

export default BadgeCollectionScreen;