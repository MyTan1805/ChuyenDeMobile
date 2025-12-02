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

    const [communityChartData, setCommunityChartData] = useState([
    { label: 'T1', report: 0, recycle: 0 },
    { label: 'T2', report: 0, recycle: 0 },
    { label: 'T3', report: 0, recycle: 0 },
    { label: 'T4', report: 0, recycle: 0 },
    { label: 'T5', report: 0, recycle: 0 },
]);

// THÊM useEffect MỚI để lấy dữ liệu thật
useEffect(() => {
    const fetchCommunityStats = async () => {
        try {
            // 1. Lấy tất cả reports
            const reportsSnap = await getDocs(collection(db, 'reports'));
            // 2. Lấy tất cả users để tính trashSorted (vì trashSorted lưu trong users.stats.trashSorted)
            const usersSnap = await getDocs(collection(db, 'users'));

            const now = new Date();
            const monthCounts = Array(12).fill().map(() => ({ report: 0, recycle: 0 }));

            // Đếm báo cáo theo tháng
            reportsSnap.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    const date = data.createdAt.toDate();
                    const month = date.getMonth(); // 0-11
                    monthCounts[month].report += 1;
                }
            });

            // Đếm trashSorted theo tháng (dựa vào updatedAt của user nếu có, hoặc createdAt)
            usersSnap.forEach(doc => {
                const data = doc.data();
                const trashSorted = data.stats?.trashSorted || 0;
                if (trashSorted === 0) return;

                let date;
                if (data.updatedAt) date = data.updatedAt.toDate();
                else if (data.createdAt) date = data.createdAt.toDate();
                else return;

                const month = date.getMonth();
                monthCounts[month].recycle += trashSorted;
            });

            // Lấy 5 tháng gần nhất
            const currentMonth = now.getMonth();
            const recentFive = [];
            for (let i = 4; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                const monthLabel = `T${monthIndex + 1}`;
                recentFive.push({
                    label: monthLabel,
                    report: monthCounts[monthIndex].report,
                    recycle: monthCounts[monthIndex].recycle,
                });
            }

            setCommunityChartData(recentFive);
            setCommunityTotal(reportsSnap.size); // tổng báo cáo toàn hệ thống
        } catch (error) {
            console.log("Lỗi lấy thống kê cộng đồng:", error);
        }
    };

    fetchCommunityStats();
}, []);

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

    // ==================== XUẤT PDF CÁ NHÂN ====================
    // ==================== XUẤT PDF CÁ NHÂN (HOÀN CHỈNH) ====================
    const handleExportPersonalPDF = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert("Lỗi", "Không tìm thấy người dùng!");
            return;
        }

        setLoadingPdf(true);
        try {
            // 1. Lấy danh sách báo cáo của user
            const q = query(
                collection(db, 'reports'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const reports = snapshot.docs.map(doc => doc.data());

            if (reports.length === 0) {
                Alert.alert("Thông báo", "Bạn chưa có báo cáo nào để xuất PDF.");
                setLoadingPdf(false);
                return;
            }

            // 2. Tạo bảng HTML chi tiết
            const rows = reports.map((item, idx) => {
                let dateStr = 'Chưa xác định';
                if (item.createdAt) {
                    if (item.createdAt.toDate) {
                        dateStr = item.createdAt.toDate().toLocaleDateString('vi-VN');
                    } else if (item.createdAt.seconds) {
                        dateStr = new Date(item.createdAt.seconds * 1000).toLocaleDateString('vi-VN');
                    }
                }

                const statusText = item.status === 'approved' ? 'Đã duyệt'
                                : item.status === 'rejected' ? 'Bị từ chối'
                                : 'Chờ duyệt';

                const statusColor = item.status === 'approved' ? '#4CAF50'
                                : item.status === 'rejected' ? '#F44336'
                                : '#FF9800';

                return `
                    <tr>
                        <td style="text-align:center">${idx + 1}</td>
                        <td>${item.violationType || 'Không xác định'}</td>
                        <td>${item.location?.address || 'Không có địa chỉ'}</td>
                        <td style="text-align:center">${dateStr}</td>
                        <td style="text-align:center; color:${statusColor}; font-weight:bold">${statusText}</td>
                    </tr>
                `;
            }).join('');

            // 3. HTML hoàn chỉnh
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: DejaVu Sans, sans-serif; padding: 30px; background: #f9f9f9; }
                    h2 { text-align: center; color: #2F847C; margin-bottom: 30px; font-size: 24px; }
                    .header { background: #2F847C; color: white; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 20px; }
                    .info { background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                    .info p { margin: 8px 0; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; }
                    th { background: #2F847C; color: white; padding: 12px; text-align: center; font-size: 14px; }
                    td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
                    tr:nth-child(even) { background-color: #f5f5f5; }
                    .footer { margin-top: 50px; text-align: center; color: #888; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>BÁO CÁO CÁ NHÂN - ECOMATE</h2>
                </div>

                <div class="info">
                    <p><strong>Người dùng:</strong> ${userProfile?.displayName || 'Thành viên Ecomate'}</p>
                    <p><strong>User ID:</strong> ${currentUser.uid}</p>
                    <p><strong>Ngày xuất báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                    <p><strong>Tổng số báo cáo:</strong> ${reports.length}</p>
                    <p><strong>Điểm thưởng hiện tại:</strong> ${userProfile?.stats?.points || 0} điểm</p>
                    <p><strong>Số lần phân loại rác:</strong> ${userProfile?.stats?.trashSorted || 0} lần</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Loại vi phạm</th>
                            <th>Địa điểm</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Cảm ơn bạn đã chung tay bảo vệ môi trường!</p>
                    <p>© 2024-2025 Ecomate App - Ứng dụng vì một Việt Nam xanh</p>
                </div>
            </body>
            </html>
            `;

            // 4. Tạo file PDF
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false
            });

            // 5. Chia sẻ
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Chia sẻ báo cáo cá nhân',
                    UTI: 'com.adobe.pdf'
                });
            } else {
                Alert.alert("Thành công", `File đã lưu tại: ${uri}`);
            }

        } catch (error) {
            console.error("Lỗi xuất PDF:", error);
            Alert.alert("Lỗi", "Không thể tạo PDF: " + error.message);
        } finally {
            setLoadingPdf(false);
        }
    };
    // ==================== RENDER UI ====================
    const stats = userProfile?.stats || {
        points: 0,
        highScore: 0,
        sentReports: 0,
        trashSorted: 0,
        recycleCount: 0,
        levelProgress: 0,
        communityStats: Array(5).fill().map((_, i) => ({ label: `T${i+1}`, report: 0, recycle: 0 }))
    };

    const quizResults = userProfile?.quizResults || {};

    // Dữ liệu hiển thị
    const displayStats = {
        ...stats,
        sentReports: realReportCount, // Đây là số báo cáo thật từ Firestore
        community: communityTotal
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
    return (
        <View style={styles.chartContainer}>
            <View style={styles.chartRow}>
                {communityChartData.map((item, index) => {
                    const reportHeight = item.report === 0 ? 4 : Math.min(item.report * 2, 120);
                    const recycleHeight = item.recycle === 0 ? 4 : Math.min(item.recycle * 0.5, 120);
                    return (
                        <View key={index} style={styles.chartCol}>
                            <View style={styles.barsGroup}>
                                <View style={[styles.bar, { 
                                    height: reportHeight, 
                                    backgroundColor: item.report === 0 ? '#E1F5FE' : '#4FC3F7' 
                                }]} />
                                <View style={[styles.bar, { 
                                    height: recycleHeight, 
                                    backgroundColor: item.recycle === 0 ? '#E0F2F1' : '#2F847C' 
                                }]} />
                            </View>
                            <Text style={styles.chartLabel}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
            <View style={{marginTop: 10, alignItems:'center'}}>
                <Text style={{color:'#555', fontSize: 12}}>
                    Tổng báo cáo toàn hệ thống: <Text style={{fontWeight:'bold', color:'#2F847C'}}>{communityTotal}</Text>
                </Text>
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