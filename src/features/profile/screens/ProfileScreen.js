import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Image, Dimensions, ActivityIndicator, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Imports từ Project
import { useUserStore } from '@/store/userStore';
import CustomHeader from '@/components/CustomHeader';
import { getDetailedBadgeStatus, ALL_BADGES } from '@/constants/badges'; 

// Firebase Imports
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';

// --- Helper Render Huy Hiệu Nhỏ ---
const renderAchievedBadgeSmall = (item) => (
    <View style={styles.achievedBadgeItem} key={item.id}>
        <View style={[styles.iconCircleAchieved, { backgroundColor: item.color + '20' }]}>
            <FontAwesome5 name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={styles.achievedBadgeLabel}>{item.name}</Text>
    </View>
);

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, userProfile, logout, fetchUserProfile } = useUserStore();

    // State thống kê
    const [realReportCount, setRealReportCount] = useState(0);
    const [communityTotal, setCommunityTotal] = useState(0);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        if (user?.uid) fetchUserProfile(user.uid);
    }, [user]);

    useEffect(() => {
        const currentUser = auth?.currentUser;
        if (!currentUser) return;
        const q1 = query(collection(db, 'reports'), where('userId', '==', currentUser.uid));
        const unsub1 = onSnapshot(q1, (snap) => setRealReportCount(snap.size));
        const q2 = query(collection(db, 'reports'));
        const unsub2 = onSnapshot(q2, (snap) => setCommunityTotal(snap.size));
        return () => { unsub1(); unsub2(); };
    }, []);

    const handleExportPersonalPDF = async () => {
        setLoadingPdf(true);
        try {
            const currentUser = auth?.currentUser;
            if (!currentUser) return;
            const q = query(collection(db, 'reports'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const reports = snapshot.docs.map(doc => doc.data());

            if (reports.length === 0) {
                Alert.alert("Thông báo", "Bạn chưa có báo cáo nào để xuất.");
                setLoadingPdf(false);
                return;
            }

            let rows = reports.map((item, idx) => {
                let dateStr = 'N/A';
                if (item.createdAt?.seconds) {
                    dateStr = new Date(item.createdAt.seconds * 1000).toLocaleDateString('vi-VN');
                }
                const statusText = item.status === 'approved' ? 'Đã duyệt' : item.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt';
                return `<tr><td style="text-align:center">${idx + 1}</td><td>${item.violationType}</td><td>${dateStr}</td><td style="text-align:center">${statusText}</td></tr>`;
            }).join('');

            const html = `
                <html><body>
                <h2 style="text-align:center;color:#2F847C">BÁO CÁO CÁ NHÂN - ECOMATE</h2>
                <p><strong>Người dùng:</strong> ${userProfile?.displayName}</p>
                <table border="1" style="width:100%;border-collapse:collapse;padding:5px;">
                    <tr style="background-color:#eee;"><th>STT</th><th>Loại vi phạm</th><th>Ngày gửi</th><th>Trạng thái</th></tr>
                    ${rows}
                </table>
                </body></html>
            `;
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (e) { Alert.alert("Lỗi", e.message); } finally { setLoadingPdf(false); }
    };

    if (!userProfile) {
         return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2F847C" />
            </View>
        );
    }

    const stats = userProfile.stats || {};
    const quizResults = userProfile.quizResults || {};
    
    const displayStats = {
        ...stats,
        sentReports: realReportCount,
        community: stats.community || 0 
    };

    const detailedBadges = getDetailedBadgeStatus(displayStats, quizResults);
    const allAchievedBadges = detailedBadges.filter(b => b.unlocked);
    
    const nextMilestone = detailedBadges.find(b => displayStats.highScore < b.threshold) || null;
    let progressValue = 0;
    let progressTarget = nextMilestone?.threshold || displayStats.highScore; 
    let progressName = nextMilestone?.name || "Đã đạt cấp cao nhất"; 

    if (nextMilestone) {
        const allThresholds = ALL_BADGES.map(b => b.threshold).filter(t => t < progressTarget).sort((a, b) => a - b);
        const previousThreshold = allThresholds.pop() || 0; 
        const range = progressTarget - previousThreshold;
        const progressInRange = displayStats.highScore - previousThreshold;
        progressValue = Math.max(0, Math.min(100, (progressInRange / range) * 100)); 
    } else {
        progressValue = 100; 
    }

    const isAdmin = userProfile.role === 'admin';

    const renderCommunityChart = () => {
        const chartData = displayStats.communityStats || [];
         return (
            <View style={styles.chartContainer}>
                <View style={styles.chartRow}>
                    {chartData.map((item, index) => {
                        const reportHeight = item.report === 0 ? 4 : item.report;
                        const recycleHeight = item.recycle === 0 ? 4 : item.recycle;
                        return (
                            <View key={index} style={styles.chartCol}>
                                <View style={styles.barsGroup}>
                                    <View style={[styles.bar, { height: reportHeight, backgroundColor: item.report===0?'#E1F5FE':'#4FC3F7' }]} />
                                    <View style={[styles.bar, { height: recycleHeight, backgroundColor: item.recycle===0?'#E0F2F1':'#2F847C' }]} />
                                </View>
                                <Text style={styles.chartLabel}>{item.label}</Text>
                            </View>
                        )
                    })}
                </View>
                <View style={{marginTop: 10, alignItems:'center'}}>
                    <Text style={{color:'#555', fontSize: 12}}>Tổng báo cáo toàn hệ thống: <Text style={{fontWeight:'bold', color:'#2F847C'}}>{communityTotal}</Text></Text>
                </View>
                <View style={styles.chartLegend}>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4FC3F7' }]} /><Text style={styles.legendText}>Báo vi phạm</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#2F847C' }]} /><Text style={styles.legendText}>Tái chế (lần)</Text></View>
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
                onNotificationPress={() => navigation.navigate('Notifications')}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Header Info (Của Tân) */}
                <View style={styles.card}>
                    <View style={styles.userInfoHeader}>
                        <View style={styles.avatarWrapper}>
                            {userProfile.photoURL ? (
                                <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder} />
                            )}
                            <TouchableOpacity style={styles.editIconBadge} onPress={() => navigation.navigate('EditProfile')}>
                                <Ionicons name="pencil" size={12} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.userInfoText}>
                            <Text style={styles.userName}>{userProfile.displayName || "Người dùng"}</Text>
                            {displayStats.points > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>Thành viên tích cực</Text>
                                </View>
                            )}
                            <Text style={styles.subText} numberOfLines={1}>
                                <Ionicons name="location-outline" size={12} /> {userProfile.location || "Chưa cập nhật"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* === KHU VỰC ADMIN (DÙNG GIAO DIỆN CỦA BẢO) === */}
                {isAdmin && (
                    <View style={[styles.card, {backgroundColor: '#2C3E50'}]}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="admin-panel-settings" size={24} color="#F1C40F" />
                            <Text style={[styles.cardTitle, {color: '#fff'}]}>Quyền Quản Trị</Text>
                        </View>
                        <Text style={{ color: '#BDC3C7', marginBottom: 15, fontSize: 13, fontFamily: 'Nunito-Regular' }}>
                            Bạn có quyền truy cập vào hệ thống quản trị viên.
                        </Text>
                        <TouchableOpacity 
                            style={styles.adminButton} 
                            onPress={() => navigation.navigate('AdminPortal')}
                        >
                            <Text style={styles.adminButtonText}>Truy cập Dashboard</Text>
                            <Ionicons name="arrow-forward" size={18} color="#2C3E50" />
                        </TouchableOpacity>
                    </View>
                )}
                {/* ================================================== */}

                {/* 2. Thành tích (Của Tân) */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="trophy" size={20} color="#FFD700" />
                        <Text style={styles.cardTitle}>Thành tích</Text>
                    </View>
                    
                    <View style={styles.pointDisplayArea}>
                        <View style={styles.pointAreaItem}>
                            <Text style={styles.pointsLabel}>ĐIỂM HIỆN TẠI</Text>
                            <Text style={styles.pointsValue}>{displayStats.points}</Text>
                        </View>
                        <View style={styles.pointAreaSeparator} />
                        <View style={styles.pointAreaItem}>
                            <Text style={styles.pointsLabel}>ĐIỂM CAO NHẤT</Text>
                            <Text style={[styles.pointsValue, { color: '#FF9800' }]}>{displayStats.highScore}</Text>
                        </View>
                    </View>

                    <View style={styles.achievedBadgesRow}>
                        {allAchievedBadges.length > 0 ? allAchievedBadges.map(renderAchievedBadgeSmall) : (
                            <Text style={styles.noBadgeText}>Chưa đạt huy hiệu nào.</Text>
                        )}
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.viewAllBadgesButton}
                        onPress={() => navigation.navigate('BadgeCollection', { detailedBadges: detailedBadges })}
                    >
                        <Text style={styles.viewAllBadgesText}>Xem toàn bộ Bộ sưu tập</Text>
                        <Ionicons name="chevron-forward" size={18} color="#2F847C" />
                    </TouchableOpacity>
                </View>

                {/* 3. Thống kê cá nhân (Của Tân) */}
                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cá nhân</Text>

                    <TouchableOpacity style={styles.statRowItem} onPress={() => navigation.navigate('ReportHistory')}>
                        <Text style={styles.statRowLabel}>Báo cáo đã gửi</Text>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Text style={[styles.statRowValue, {color:'#2F847C'}]}>{displayStats.sentReports}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#ccc" style={{marginLeft:5}}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.separator} />

                    <View style={styles.statRowItem}>
                        <Text style={styles.statRowLabel}>Lần phân loại rác</Text>
                        <Text style={styles.statRowValue}>{displayStats.trashSorted}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Tiến độ lên cấp: <Text style={styles.progressLabelName}>{progressName}</Text></Text>
                            <Text style={styles.progressValue}>{Math.floor(progressValue)}%</Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${progressValue}%` }]} />
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

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleExportPersonalPDF} disabled={loadingPdf}>
                        {loadingPdf ? <ActivityIndicator color="#333"/> : <Text style={styles.secondaryButtonText}>Xuất Báo cáo cá nhân (PDF)</Text>}
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

    card: {
        backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },

    // --- STYLE CHO ADMIN CARD (CỦA BẢO) ---
    adminButton: {
        backgroundColor: '#F1C40F', // Màu vàng nổi bật
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
    },
    adminButtonText: {
        fontFamily: 'Nunito-Bold',
        color: '#2C3E50', // Chữ màu tối
        marginRight: 8
    },
    // -------------------------------------

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

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, marginLeft: 8, color: '#333' },
    
    pointDisplayArea: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 10, marginBottom: 15,
    },
    pointAreaItem: { alignItems: 'center', flex: 1 },
    pointAreaSeparator: { width: 1, height: 60, backgroundColor: '#E0E0E0', marginHorizontal: 10 },
    pointsLabel: { fontFamily: 'Nunito-Regular', color: '#757575', fontSize: 14, textAlign: 'center' },
    pointsValue: { fontFamily: 'Nunito-Bold', fontSize: 28, color: '#333', marginTop: 5, textAlign: 'center' },
    
    achievedBadgesRow: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
        paddingVertical: 15, minHeight: 40, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    achievedBadgeItem: { alignItems: 'center', width: 80, marginHorizontal: 5, marginBottom: 10 },
    achievedBadgeLabel: { fontSize: 12, fontFamily: 'Nunito-Bold', color: '#333', textAlign: 'center', marginTop: 5 },
    noBadgeText: { fontFamily: 'Nunito-Regular', color: '#999', textAlign: 'center', marginVertical: 10 },
    iconCircleAchieved: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    viewAllBadgesButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginTop: 10 },
    viewAllBadgesText: { fontFamily: 'Nunito-Bold', color: '#2F847C', fontSize: 16 },
    
    cardTitleBold: { fontFamily: 'Nunito-Bold', fontSize: 18, marginBottom: 16, color: '#333' },
    statRowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    statRowLabel: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#555' },
    statRowValue: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    separator: { height: 1, backgroundColor: '#F0F0F0' },
    progressContainer: { marginTop: 15, paddingVertical: 10, backgroundColor: '#F9F9F9', borderRadius: 12 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 10 },
    progressLabel: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#757575' },
    progressLabelName: { fontFamily: 'Nunito-Bold', color: '#2F847C' },
    progressValue: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#2F847C' },
    progressBarTrack: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 },
    progressBarFill: { height: '100%', backgroundColor: '#2F847C', borderRadius: 4 },

    chartSubtitle: { fontFamily: 'Nunito-Regular', color: '#757575', fontSize: 13, marginBottom: 20 },
    chartContainer: { alignItems: 'center' },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 120, alignItems: 'flex-end', paddingHorizontal: 10 },
    chartCol: { alignItems: 'center', width: 40 },
    barsGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    bar: { width: 8, borderRadius: 4 },
    chartLabel: { marginTop: 8, fontSize: 12, color: '#757575', fontFamily: 'Nunito-Bold' },
    chartLegend: { flexDirection: 'row', marginTop: 20, gap: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: '#555' },

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