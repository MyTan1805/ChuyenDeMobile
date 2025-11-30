import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { useUserStore } from '@/store/userStore';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Firebase
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';

const ADMIN_IDS = ["", "rMWE0wFBdnVGWYoxYbNo3uhLxJ73"];

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, userProfile, logout, fetchUserProfile } = useUserStore();
    
    const [realReportCount, setRealReportCount] = useState(0);
    const [communityTotal, setCommunityTotal] = useState(0);
    const [loadingPdf, setLoadingPdf] = useState(false);

    const currentUser = auth?.currentUser;
    const isAdmin = currentUser && ADMIN_IDS.includes(currentUser.uid);

    useEffect(() => { if (user?.uid) fetchUserProfile(user.uid); }, [user]);

    // 1. Đếm báo cáo CÁ NHÂN
    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'reports'), where('userId', '==', currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => setRealReportCount(snapshot.size));
        return () => unsubscribe();
    }, [currentUser]);

    // 2. Đếm báo cáo CỘNG ĐỒNG (Toàn bộ hệ thống)
    useEffect(() => {
        const q = query(collection(db, 'reports'));
        const unsubscribe = onSnapshot(q, (snapshot) => setCommunityTotal(snapshot.size));
        return () => unsubscribe();
    }, []);

    // --- XUẤT PDF ---
    const handleExportPersonalPDF = async () => {
        if (!currentUser) return;
        setLoadingPdf(true);
        try {
            const q = query(collection(db, 'reports'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const reports = snapshot.docs.map(doc => doc.data());

            if (reports.length === 0) {
                Alert.alert("Thông báo", "Bạn chưa có báo cáo nào để xuất.");
                setLoadingPdf(false);
                return;
            }

            let rows = reports.map((item, idx) => {
                // Format ngày tháng an toàn (tránh lỗi Object invalid)
                let dateStr = 'N/A';
                if (item.createdAt?.seconds) {
                    dateStr = new Date(item.createdAt.seconds * 1000).toLocaleDateString();
                } else if (item.createdAt instanceof Date) {
                    dateStr = item.createdAt.toLocaleDateString();
                } else if (typeof item.createdAt === 'string') {
                    dateStr = item.createdAt;
                }
                
                const statusText = item.status === 'approved' ? 'Đã duyệt' : item.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt';
                const statusColor = item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'orange';

                return `<tr><td style="text-align:center">${idx + 1}</td><td>${item.violationType}</td><td>${item.location?.address || ''}</td><td style="text-align:center">${dateStr}</td><td style="text-align:center; color:${statusColor}">${statusText}</td></tr>`;
            }).join('');

            const html = `
                <html><head><style>body{font-family:Helvetica;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;font-size:12px}th{background-color:#2F847C;color:white}</style></head>
                <body><h2 style="text-align:center;color:#2F847C">BÁO CÁO CÁ NHÂN - ECOMATE</h2>
                <div class="user-info">
                    <p><strong>Người dùng:</strong> ${userProfile?.displayName || 'Thành viên Ecomate'}</p>
                    <p><strong>User ID:</strong> ${currentUser.uid}</p>
                    <p><strong>Ngày xuất báo cáo:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Tổng số báo cáo:</strong> ${reports.length}</p>
                </div>
                <table><tr><th>STT</th><th>Loại</th><th>Địa điểm</th><th>Ngày gửi</th><th>Trạng thái</th></tr>${rows}</table>
                <p style="margin-top: 50px; text-align: center; font-size: 12px; color: #888;">Cảm ơn bạn đã chung tay vì một môi trường xanh - sạch - đẹp.</p>
                </body></html>
            `;
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (e) { Alert.alert("Lỗi", "Không thể xuất PDF: " + e.message); } finally { setLoadingPdf(false); }
    };

    // Hàm format ngày tham gia an toàn
    const formatJoinDate = (dateValue) => {
        if (!dateValue) return 'Tháng 1/2024';
        if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString();
        if (dateValue instanceof Date) return dateValue.toLocaleDateString();
        if (typeof dateValue === 'string') return dateValue;
        return 'N/A';
    };

    const displayData = userProfile || { displayName: "...", location: "...", photoURL: null };
    
    // Fix lỗi hiển thị Text (ép kiểu String)
    const safeDisplayName = typeof displayData.displayName === 'string' ? displayData.displayName : "User";
    const safeLocation = typeof displayData.location === 'string' ? displayData.location : "...";

    const stats = { ...(displayData.stats || {}), sentReports: realReportCount };
    
    // Dữ liệu biểu đồ giả lập (kết hợp số liệu thật communityTotal)
    const chartData = [
        { label: 'T1', report: 10, recycle: 25 }, { label: 'T2', report: 15, recycle: 30 },
        { label: 'T3', report: 8, recycle: 45 }, { label: 'T4', report: 12, recycle: 20 }, { label: 'T5', report: 20, recycle: 50 }
    ];

    const renderStatItem = (icon, label, color) => (
        <View style={styles.statIconItem}>
            <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}><FontAwesome5 name={icon} size={20} color={color} /></View>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const renderCommunityChart = () => (
        <View style={styles.chartContainer}>
            <View style={styles.chartRow}>{chartData.map((item, i) => (
                <View key={i} style={styles.chartCol}>
                    <View style={styles.barsGroup}>
                        <View style={[styles.bar, { height: item.report * 1.5, backgroundColor: '#4FC3F7' }]} />
                        <View style={[styles.bar, { height: item.recycle * 1.5, backgroundColor: '#2F847C' }]} />
                    </View>
                    <Text style={styles.chartLabel}>{item.label}</Text>
                </View>
            ))}</View>
            
            {/* Hiển thị số liệu thật từ Firebase */}
            <View style={{marginTop: 15, alignItems:'center'}}>
                <Text style={{color:'#555'}}>Tổng báo cáo toàn hệ thống</Text>
                <Text style={{color:'#2F847C',fontSize:28,fontWeight:'bold'}}>{communityTotal}</Text>
            </View>
            <View style={styles.chartLegend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4FC3F7' }]} /><Text style={styles.legendText}>Báo vi phạm</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#2F847C' }]} /><Text style={styles.legendText}>Tái chế (lần)</Text></View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Trang Cá Nhân" showNotificationButton={true} showSettingsButton={true} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.userInfoHeader}>
                        <View style={styles.avatarWrapper}>
                            {displayData.photoURL ? <Image source={{ uri: displayData.photoURL }} style={styles.avatarImage} /> : <View style={styles.avatarPlaceholder} />}
                            <TouchableOpacity style={styles.editIconBadge} onPress={() => navigation.navigate('EditProfile')}><Ionicons name="pencil" size={12} color="white" /></TouchableOpacity>
                        </View>
                        <View style={styles.userInfoText}>
                            <Text style={styles.userName}>{String(displayData.displayName || "User")}</Text>
                            <Text style={styles.subText}><Ionicons name="location-outline" size={12} /> {String(displayData.location || "...")}</Text>
                        </View>
                    </View>
                </View>

                {isAdmin && (
                    <View style={[styles.card, {backgroundColor: '#2C3E50'}]}>
                        <View style={styles.cardHeader}><MaterialIcons name="admin-panel-settings" size={24} color="#F1C40F" /><Text style={[styles.cardTitle, {color: '#fff'}]}>Quyền Quản Trị</Text></View>
                        <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminPortal')}><Text style={styles.adminButtonText}>Truy cập Dashboard</Text><Ionicons name="arrow-forward" size={18} color="#2C3E50" /></TouchableOpacity>
                    </View>
                )}

                <View style={styles.card}>
                    <View style={styles.cardHeader}><Ionicons name="trophy" size={20} color="#FFD700" /><Text style={styles.cardTitle}>Thành tích</Text></View>
                    <View style={styles.statsRow}>{renderStatItem("leaf", "Người xanh", "#4CAF50")}{renderStatItem("seedling", "Chiến binh MT", "#2F847C")}{renderStatItem("city", "Thành phố sạch", "#607D8B")}</View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cá nhân</Text>
                    <TouchableOpacity style={styles.statRowItem} onPress={() => navigation.navigate('ReportHistory')} activeOpacity={0.6}>
                        <Text style={styles.statRowLabel}>Báo cáo đã gửi</Text>
                        <View style={{flexDirection:'row', alignItems:'center'}}><Text style={[styles.statRowValue, {color:'#2F847C'}]}>{stats.sentReports}</Text><Ionicons name="chevron-forward" size={18} color="#ccc" style={{marginLeft:8}}/></View>
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <View style={styles.statRowItem}><Text style={styles.statRowLabel}>Tham gia cộng đồng</Text><Text style={styles.statRowValue}>{String(stats.community || 0)}</Text></View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cộng đồng</Text>
                    {renderCommunityChart()}
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EditProfile')}><Text style={styles.secondaryButtonText}>Chỉnh sửa trang cá nhân</Text></TouchableOpacity>
                    
                    {/* Nút Xuất PDF */}
                    <TouchableOpacity style={[styles.secondaryButton, {borderColor: '#2F847C'}]} onPress={handleExportPersonalPDF} disabled={loadingPdf}>
                        {loadingPdf ? <Text style={[styles.secondaryButtonText, {color: '#2F847C'}]}>Đang tạo PDF...</Text> : <View style={{flexDirection:'row', alignItems:'center'}}><FontAwesome5 name="file-pdf" size={16} color="#2F847C" style={{marginRight:8}} /><Text style={[styles.secondaryButtonText, {color: '#2F847C'}]}>Xuất Báo cáo cá nhân</Text></View>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}><Ionicons name="log-out-outline" size={20} color="#FF5252" style={{marginRight:8}} /><Text style={styles.logoutText}>Đăng xuất</Text></TouchableOpacity>
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    scrollContent: { padding: 16 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    adminButton: { backgroundColor: '#F1C40F', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    adminButtonText: { fontWeight: 'bold', color: '#2C3E50', marginRight: 8 },
    userInfoHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarWrapper: { position: 'relative' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0' },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2F847C', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'white' },
    userInfoText: { marginLeft: 20, flex: 1 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    subText: { color: '#757575', fontSize: 14 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#333' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    statIconItem: { alignItems: 'center' },
    iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statLabel: { fontSize: 12, fontWeight: 'bold', color: '#555', textAlign: 'center', width: 80 },
    cardTitleBold: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
    statRowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center' },
    statRowLabel: { fontSize: 16, color: '#555' },
    statRowValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    separator: { height: 1, backgroundColor: '#F0F0F0' },
    chartSubtitle: { color: '#757575', fontSize: 13, marginBottom: 20 },
    chartContainer: { alignItems: 'center' },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 120, alignItems: 'flex-end', paddingHorizontal: 10 },
    chartCol: { alignItems: 'center', width: 40 },
    barsGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    bar: { width: 8, borderRadius: 4 },
    chartLabel: { marginTop: 8, fontSize: 12, color: '#757575', fontWeight: 'bold' },
    chartLegend: { flexDirection: 'row', marginTop: 20, gap: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: '#555' },
    actionContainer: { gap: 12 },
    secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
    secondaryButtonText: { fontWeight: 'bold', color: '#333', fontSize: 15 },
    logoutButton: { flexDirection: 'row', backgroundColor: '#FFEBEE', paddingVertical: 14, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    logoutText: { fontWeight: 'bold', color: '#FF5252', fontSize: 15 },
});

export default ProfileScreen;