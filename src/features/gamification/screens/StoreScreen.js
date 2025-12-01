import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Image, ActivityIndicator, Alert, Dimensions, FlatList, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Cần cài expo-linear-gradient
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '@/components/CustomHeader';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useUserStore } from '@/store/userStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Tính toán chiều rộng card cho 2 cột

// Danh mục lọc giả định (Bạn có thể thêm field 'type' vào DB sau này)
const FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'voucher', label: 'Voucher' },
    { id: 'item', label: 'Vật phẩm' },
    { id: 'donate', label: 'Quyên góp' },
];

// --- COMPONENT CON: THẺ QUÀ TẶNG (LUXURY STYLE) ---
const RewardCard = ({ item, userPoints, onExchange }) => {
    const isAffordable = userPoints >= item.cost;

    return (
        <View style={styles.cardContainer}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                {!isAffordable && (
                    <View style={styles.lockedOverlay}>
                        <Ionicons name="lock-closed" size={20} color="#fff" />
                    </View>
                )}
                <View style={styles.costBadge}>
                    <Text style={styles.costText}>{item.cost}</Text>
                    <Ionicons name="sparkles" size={10} color="#FFD700" style={{ marginLeft: 2 }} />
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>

                <TouchableOpacity
                    style={[
                        styles.exchangeBtn,
                        !isAffordable && styles.exchangeBtnDisabled
                    ]}
                    onPress={() => onExchange(item)}
                    disabled={!isAffordable}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.exchangeBtnText, !isAffordable && { color: '#999' }]}>
                        {isAffordable ? 'Đổi Ngay' : 'Thiếu điểm'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const StoreScreen = ({ navigation }) => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isExchanging, setIsExchanging] = useState(false);

    const userPoints = useUserStore(state => state.userProfile?.stats?.points || 0);
    const exchangePointsForReward = useUserStore(state => state.exchangePointsForReward);

    // Fetch dữ liệu
    useEffect(() => {
        const rewardsRef = ref(database, 'rewards');
        const unsubscribe = onValue(rewardsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const rewardsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // Sắp xếp theo giá rẻ -> đắt
                setRewards(rewardsArray.sort((a, b) => a.cost - b.cost));
            }
            setLoading(false);
        }, (error) => {
            console.error("Store Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Lọc sản phẩm (Giả lập logic lọc vì DB chưa có field type, mặc định show all nếu không khớp)
    const filteredRewards = useMemo(() => {
        if (activeFilter === 'all') return rewards;
        // Logic giả định: Nếu item.type tồn tại thì lọc, không thì trả về rỗng hoặc logic tùy chỉnh
        return rewards.filter(r => r.type === activeFilter || activeFilter === 'all');
    }, [rewards, activeFilter]);

    const handleExchange = (reward) => {
        if (isExchanging) return;
        Alert.alert(
            "Xác nhận đổi quà",
            `Bạn muốn dùng ${reward.cost} điểm để đổi "${reward.name}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: async () => {
                        setIsExchanging(true);
                        const result = await exchangePointsForReward(reward.cost);
                        setIsExchanging(false);

                        if (result.success) {
                            Alert.alert("Thành công! 🎉", `Bạn đã nhận được ${reward.name}. Kiểm tra kho quà của bạn nhé!`);
                        } else {
                            Alert.alert("Thất bại", "Điểm của bạn không đủ hoặc có lỗi xảy ra.");
                        }
                    }
                }
            ]
        );
    };

    // --- HEADER COMPONENT CHO FLATLIST ---
    const ListHeader = () => (
        <View style={styles.headerSection}>
            {/* 1. BALANCE CARD */}
            <LinearGradient
                colors={['#2F847C', '#164E48']} // Gradient Xanh đậm sang trọng
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
            >
                <View>
                    <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceValue}>{userPoints.toLocaleString()}</Text>
                        <MaterialCommunityIcons name="star-four-points" size={24} color="#FFD700" style={{ marginLeft: 8 }} />
                    </View>
                </View>
                <View style={styles.balanceIconBg}>
                    <Ionicons name="gift-outline" size={60} color="rgba(255,255,255,0.2)" />
                </View>
            </LinearGradient>

            {/* 2. CATEGORY TABS */}
            <View style={styles.tabsContainer}>
                {FILTERS.map((item) => {
                    const isActive = activeFilter === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.tabItem, isActive && styles.tabItemActive]}
                            onPress={() => setActiveFilter(item.id)}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <CustomHeader title="Eco Store" showBackButton={false} useLogo={true} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F847C" />
                </View>
            ) : (
                <FlatList
                    data={filteredRewards}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <RewardCard item={item} userPoints={userPoints} onExchange={handleExchange} />
                    )}
                    numColumns={2} // Grid 2 cột
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={ListHeader}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="store-remove" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có quà trong mục này.</Text>
                        </View>
                    }
                />
            )}

            {/* Loading Overlay khi đổi quà */}
            {isExchanging && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#2F847C" />
                        <Text style={styles.loadingText}>Đang xử lý...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' }, // Nền xám rất nhạt, sạch sẽ
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    listContent: { paddingBottom: 40 },
    columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 },

    // --- HEADER STYLES ---
    headerSection: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 10 },

    balanceCard: {
        borderRadius: 24,
        padding: 24,
        height: 140,
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: "#2F847C",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden'
    },
    balanceLabel: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4
    },
    balanceRow: { flexDirection: 'row', alignItems: 'center' },
    balanceValue: {
        fontFamily: 'LilitaOne-Regular', // Font số to, đậm
        fontSize: 42,
        color: '#fff',
        includeFontPadding: false
    },
    balanceIconBg: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        transform: [{ rotate: '-15deg' }]
    },

    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: '#F0F2F5',
        borderRadius: 16,
        padding: 4,
        justifyContent: 'space-between'
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabItemActive: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    tabText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 13,
        color: '#999'
    },
    tabTextActive: {
        color: '#2F847C'
    },

    sectionTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 18,
        color: '#333',
        marginBottom: 16,
        marginLeft: 4
    },

    // --- CARD STYLES ---
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden'
    },
    imageWrapper: {
        height: 130,
        width: '100%',
        position: 'relative'
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    costBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    costText: {
        color: '#FFD700',
        fontFamily: 'Nunito-Bold',
        fontSize: 12
    },
    cardContent: {
        padding: 12,
        justifyContent: 'space-between',
        flex: 1
    },
    cardTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
        height: 40 // Cố định chiều cao title 2 dòng
    },
    exchangeBtn: {
        backgroundColor: '#2F847C',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    exchangeBtnDisabled: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE'
    },
    exchangeBtnText: {
        color: '#fff',
        fontFamily: 'Nunito-Bold',
        fontSize: 12
    },

    // --- OTHER STYLES ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        fontFamily: 'Nunito-Regular',
        color: '#999',
        marginTop: 10
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
    },
    loadingBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Nunito-Bold',
        color: '#333'
    }
});

export default StoreScreen;