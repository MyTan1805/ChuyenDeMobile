import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useUserStore } from '@/store/userStore';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { collection, query, where, onSnapshot, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, userProfile, logout, fetchUserProfile } = useUserStore();
    
    const [realReportCount, setRealReportCount] = useState(0);
    const [communityTotal, setCommunityTotal] = useState(0);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingRole, setLoadingRole] = useState(true);

    const currentUser = auth?.currentUser;

    // ==================== CHECK ADMIN ROLE TỪ FIRESTORE ====================
    useEffect(() => {
        const checkAdminRole = async () => {
            if (!currentUser) {
                setIsAdmin(false);
                setLoadingRole(false);
                return;
            }

            try {
                setLoadingRole(true);
                
                // Lấy document user từ collection 'users'
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    // Check field 'role' - nếu là 'admin' thì set quyền
                    if (userData.role === 'admin') {
                        setIsAdmin(true);
                        console.log("✅ Admin role confirmed for:", currentUser.uid);
                    } else {
                        setIsAdmin(false);
                        console.log("👤 Regular user:", currentUser.uid, "Role:", userData.role || 'none');
                    }
                } else {
                    // User document không tồn tại
                    console.log("⚠️ User document not found for:", currentUser.uid);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("❌ Error checking admin role:", error);
                setIsAdmin(false);
            } finally {
                setLoadingRole(false);
            }
        };

        checkAdminRole();
    }, [currentUser]);

    // ==================== LOAD USER PROFILE ====================
    useEffect(() => { 
        if (user?.uid) fetchUserProfile(user.uid); 
    }, [user]);

    // ==================== ĐẾM BÁO CÁO CÁ NHÂN ====================
    useEffect(() => {
        if (!currentUser) return;
        
        const q = query(
            collection(db, 'reports'), 
            where('userId', '==', currentUser.uid)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRealReportCount(snapshot.size);
        });
        
        return () => unsubscribe();
    }, [currentUser]);

    // ==================== ĐẾM TỔNG BÁO CÁO CỘNG ĐỒNG ====================
    useEffect(() => {
        const q = query(collection(db, 'reports'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCommunityTotal(snapshot.size);
        });
        
        return () => unsubscribe();
    }, []);

    // ==================== XUẤT PDF CÁ NHÂN ====================
const handleExportPersonalPDF = async () => {
    if (!currentUser) return;
    
    setLoadingPdf(true);
    try {
        // Lấy 3 thông tin cần thiết
        const recycleCount = userProfile?.stats?.recycleCount || 0;
        const points = userProfile?.stats?.points || 0;
        const reportCount = realReportCount;

        const html = `
            <html>
            <head>
                <style>
                    body { 
                        font-family: Helvetica, Arial, sans-serif; 
                        padding: 40px; 
                    }
                    h2 { 
                        text-align: center; 
                        color: #2F847C; 
                        margin-bottom: 30px;
                    }
                    .user-info { 
                        margin: 20px 0; 
                        padding: 15px; 
                        background-color: #f5f5f5; 
                        border-radius: 8px; 
                    }
                    .user-info p { 
                        margin: 5px 0; 
                    }
                    .stats-table {
                        width: 100%;
                        margin-top: 30px;
                        border-collapse: collapse;
                    }
                    .stats-table td {
                        padding: 15px;
                        border-bottom: 1px solid #ddd;
                        font-size: 16px;
                    }
                    .stats-table td:first-child {
                        color: #666;
                        width: 60%;
                    }
                    .stats-table td:last-child {
                        font-weight: bold;
                        color: #2F847C;
                        font-size: 20px;
                        text-align: right;
                    }
                    .footer { 
                        margin-top: 40px; 
                        text-align: center; 
                        font-size: 11px; 
                        color: #888; 
                    }
                </style>
            </head>
            <body>
                <h2>BÁO CÁO CÁ NHÂN - ECOMATE</h2>
                
                <div class="user-info">
                    <p><strong>Người dùng:</strong> ${userProfile?.displayName || 'Thành viên Ecomate'}</p>
                    <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>

                <table class="stats-table">
                    <tr>
                        <td>Số lần phân loại rác</td>
                        <td>${recycleCount} lần</td>
                    </tr>
                    <tr>
                        <td>Số báo cáo đã gửi</td>
                        <td>${reportCount} báo cáo</td>
                    </tr>
                    <tr>
                        <td>Điểm thưởng</td>
                        <td>${points} điểm</td>
                    </tr>
                </table>

                <div class="footer">
                    <p>Cảm ơn bạn đã chung tay vì một môi trường xanh - sạch - đẹp.</p>
                    <p>© 2024 Ecomate - Ứng dụng bảo vệ môi trường</p>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { 
            UTI: '.pdf', 
            mimeType: 'application/pdf' 
        });
    } catch (error) {
        console.error("Error exporting PDF:", error);
        Alert.alert("Lỗi", "Không thể xuất PDF: " + error.message);
    } finally {
        setLoadingPdf(false);
    }
};
    // ==================== RENDER UI ====================
    const displayData = userProfile || { 
        displayName: "...", 
        location: "...", 
        photoURL: null 
    };
    
    const stats = { 
        ...(displayData.stats || {}), 
        sentReports: realReportCount 
    };
    
    const chartData = [
        { label: 'T1', report: 10, recycle: 25 },
        { label: 'T2', report: 15, recycle: 30 },
        { label: 'T3', report: 8, recycle: 45 },
        { label: 'T4', report: 12, recycle: 20 },
        { label: 'T5', report: 20, recycle: 50 }
    ];

    const renderStatItem = (icon, label, color) => (
        <View style={styles.statIconItem}>
            <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                <FontAwesome5 name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const renderCommunityChart = () => (
        <View style={styles.chartContainer}>
            <View style={styles.chartRow}>
                {chartData.map((item, i) => (
                    <View key={i} style={styles.chartCol}>
                        <View style={styles.barsGroup}>
                            <View style={[styles.bar, { 
                                height: item.report * 1.5, 
                                backgroundColor: '#4FC3F7' 
                            }]} />
                            <View style={[styles.bar, { 
                                height: item.recycle * 1.5, 
                                backgroundColor: '#2F847C' 
                            }]} />
                        </View>
                        <Text style={styles.chartLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>
            
            <View style={{marginTop: 15, alignItems:'center'}}>
                <Text style={{color:'#555', fontSize: 13}}>
                    Tổng báo cáo toàn hệ thống
                </Text>
                <Text style={{
                    color:'#2F847C',
                    fontSize:28,
                    fontWeight:'bold',
                    marginTop: 5
                }}>
                    {communityTotal}
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

    return (
        <View style={styles.container}>
            <CustomHeader 
                title="Trang Cá Nhân" 
                showNotificationButton={true} 
                showSettingsButton={true} 
            />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* USER INFO CARD */}
                <View style={styles.card}>
                    <View style={styles.userInfoHeader}>
                        <View style={styles.avatarWrapper}>
                            {displayData.photoURL ? (
                                <Image 
                                    source={{ uri: displayData.photoURL }} 
                                    style={styles.avatarImage} 
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder} />
                            )}
                            <TouchableOpacity 
                                style={styles.editIconBadge} 
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <Ionicons name="pencil" size={12} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.userInfoText}>
                            <Text style={styles.userName}>
                                {String(displayData.displayName || "User")}
                            </Text>
                            <Text style={styles.subText}>
                                <Ionicons name="location-outline" size={12} /> 
                                {String(displayData.location || "...")}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ADMIN PANEL - CHỈ HIỆN KHI isAdmin = true */}
                {!loadingRole && isAdmin && (
                    <View style={[styles.card, {backgroundColor: '#2C3E50'}]}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons 
                                name="admin-panel-settings" 
                                size={24} 
                                color="#F1C40F" 
                            />
                            <Text style={[styles.cardTitle, {color: '#fff'}]}>
                                Quyền Quản Trị
                            </Text>
                        </View>
                        <Text style={{
                            color: '#BDC3C7', 
                            marginBottom: 15, 
                            fontSize: 13
                        }}>
                            Bạn có quyền truy cập vào hệ thống quản trị viên.
                        </Text>
                        <TouchableOpacity 
                            style={styles.adminButton} 
                            onPress={() => navigation.navigate('AdminPortal')}
                        >
                            <Text style={styles.adminButtonText}>
                                Truy cập Dashboard
                            </Text>
                            <Ionicons 
                                name="arrow-forward" 
                                size={18} 
                                color="#2C3E50" 
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ACHIEVEMENTS CARD */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="trophy" size={20} color="#FFD700" />
                        <Text style={styles.cardTitle}>Thành tích</Text>
                    </View>
                    <View style={styles.statsRow}>
                        {renderStatItem("leaf", "Người xanh", "#4CAF50")}
                        {renderStatItem("seedling", "Chiến binh MT", "#2F847C")}
                        {renderStatItem("city", "Thành phố sạch", "#607D8B")}
                    </View>
                </View>

                {/* PERSONAL STATS CARD */}
                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cá nhân</Text>
                    
                    <TouchableOpacity 
                        style={styles.statRowItem} 
                        onPress={() => navigation.navigate('ReportHistory')} 
                        activeOpacity={0.6}
                    >
                        <Text style={styles.statRowLabel}>Báo cáo đã gửi</Text>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Text style={[styles.statRowValue, {color:'#2F847C'}]}>
                                {stats.sentReports}
                            </Text>
                            <Ionicons 
                                name="chevron-forward" 
                                size={18} 
                                color="#ccc" 
                                style={{marginLeft:8}}
                            />
                        </View>
                    </TouchableOpacity>
                    
                    <View style={styles.separator} />
                    
                    <View style={styles.statRowItem}>
                        <Text style={styles.statRowLabel}>Tham gia cộng đồng</Text>
                        <Text style={styles.statRowValue}>
                            {String(stats.community || 0)}
                        </Text>
                    </View>
                </View>

                {/* COMMUNITY STATS CARD */}
                <View style={styles.card}>
                    <Text style={styles.cardTitleBold}>Thống kê cộng đồng</Text>
                    {renderCommunityChart()}
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.secondaryButton} 
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Chỉnh sửa trang cá nhân
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.secondaryButton, {borderColor: '#2F847C'}]} 
                        onPress={handleExportPersonalPDF} 
                        disabled={loadingPdf}
                    >
                        {loadingPdf ? (
                            <Text style={[styles.secondaryButtonText, {color: '#2F847C'}]}>
                                Đang tạo PDF...
                            </Text>
                        ) : (
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <FontAwesome5 
                                    name="file-pdf" 
                                    size={16} 
                                    color="#2F847C" 
                                    style={{marginRight:8}} 
                                />
                                <Text style={[styles.secondaryButtonText, {color: '#2F847C'}]}>
                                    Xuất Báo cáo cá nhân
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.logoutButton} 
                        onPress={logout}
                    >
                        <Ionicons 
                            name="log-out-outline" 
                            size={20} 
                            color="#FF5252" 
                            style={{marginRight:8}} 
                        />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    scrollContent: { padding: 16 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 16, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 8, 
        elevation: 3 
    },
    adminButton: { 
        backgroundColor: '#F1C40F', 
        padding: 12, 
        borderRadius: 8, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10 
    },
    adminButtonText: { 
        fontWeight: 'bold', 
        color: '#2C3E50', 
        marginRight: 8 
    },
    userInfoHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarWrapper: { position: 'relative' },
    avatarPlaceholder: { 
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: '#E0E0E0' 
    },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    editIconBadge: { 
        position: 'absolute', 
        bottom: 0, 
        right: 0, 
        backgroundColor: '#2F847C', 
        padding: 6, 
        borderRadius: 12, 
        borderWidth: 2, 
        borderColor: 'white' 
    },
    userInfoText: { marginLeft: 20, flex: 1 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    subText: { color: '#757575', fontSize: 14 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#333' },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginTop: 10 
    },
    statIconItem: { alignItems: 'center' },
    iconCircle: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    statLabel: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#555', 
        textAlign: 'center', 
        width: 80 
    },
    cardTitleBold: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 16, 
        color: '#333' 
    },
    statRowItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 12, 
        alignItems: 'center' 
    },
    statRowLabel: { fontSize: 16, color: '#555' },
    statRowValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    separator: { height: 1, backgroundColor: '#F0F0F0' },
    chartContainer: { alignItems: 'center' },
    chartRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%', 
        height: 120, 
        alignItems: 'flex-end', 
        paddingHorizontal: 10 
    },
    chartCol: { alignItems: 'center', width: 40 },
    barsGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    bar: { width: 8, borderRadius: 4 },
    chartLabel: { 
        marginTop: 8, 
        fontSize: 12, 
        color: '#757575', 
        fontWeight: 'bold' 
    },
    chartLegend: { flexDirection: 'row', marginTop: 20, gap: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: '#555' },
    actionContainer: { gap: 12 },
    secondaryButton: { 
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#E0E0E0', 
        paddingVertical: 14, 
        borderRadius: 25, 
        alignItems: 'center' 
    },
    secondaryButtonText: { 
        fontWeight: 'bold', 
        color: '#333', 
        fontSize: 15 
    },
    logoutButton: { 
        flexDirection: 'row', 
        backgroundColor: '#FFEBEE', 
        paddingVertical: 14, 
        borderRadius: 25, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 10 
    },
    logoutText: { fontWeight: 'bold', color: '#FF5252', fontSize: 15 },
});

export default ProfileScreen;