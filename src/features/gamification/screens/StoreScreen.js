// src/features/gamification/screens/StoreScreen.jsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/config/firebaseConfig'; // <-- SỬ DỤNG REALTIME DB
import { ref, onValue } from 'firebase/database';
import { useUserStore } from '@/store/userStore';

const { width } = Dimensions.get('window');

// --- COMPONENT CON: HIỂN THỊ QUÀ TẶNG ---
const RewardCard = ({ item, userPoints, onExchange }) => {
    const isAffordable = userPoints >= item.cost;
    const pointsNeeded = item.cost - userPoints;

    return (
        <View style={styles.rewardCard}>
            <Image source={{ uri: item.image }} style={styles.rewardImage} />
            <View style={styles.rewardContent}>
                <Text style={styles.rewardTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.rewardDescription} numberOfLines={2}>{item.description}</Text>

                <View style={styles.costContainer}>
                    <Ionicons name="sparkles" size={18} color="#FF9800" />
                    <Text style={styles.costText}>{item.cost} điểm</Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.exchangeButton,
                        !isAffordable && styles.exchangeButtonDisabled
                    ]}
                    onPress={() => onExchange(item)}
                    disabled={!isAffordable}
                >
                    <Text style={styles.exchangeButtonText}>
                        {isAffordable ? 'Đổi quà' : `Thiếu ${pointsNeeded} điểm`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
// ----------------------------------------


const StoreScreen = ({ navigation }) => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExchanging, setIsExchanging] = useState(false); // State chỉ cho giao dịch

    // Lấy điểm hiện tại và hàm đổi quà từ Store
    const userPoints = useUserStore(state => state.userProfile?.stats?.points || 0);
    const exchangePointsForReward = useUserStore(state => state.exchangePointsForReward);

    // Fetch dữ liệu quà tặng từ Firebase Realtime Database
    useEffect(() => {
        const rewardsRef = ref(database, 'rewards');
        const unsubscribe = onValue(rewardsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const rewardsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setRewards(rewardsArray);
            }
            setLoading(false);
        }, (error) => {
            console.error("Lỗi đọc dữ liệu Rewards:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Xử lý khi người dùng nhấn đổi quà
    const handleExchange = async (reward) => {
        if (isExchanging) return;

        Alert.alert(
            "Xác nhận đổi quà",
            `Bạn có chắc chắn muốn đổi "${reward.name}" với ${reward.cost} điểm không?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đổi ngay",
                    style: "default",
                    onPress: async () => {
                        setIsExchanging(true); // Bật loading giao dịch

                        const result = await exchangePointsForReward(reward.cost);

                        setIsExchanging(false); // Tắt loading

                        if (result.success) {
                            Alert.alert("Thành công!", `Bạn đã đổi ${reward.name} thành công. Chúng tôi sẽ liên hệ để gửi quà cho bạn!`);
                        } else if (result.error === "INSUFFICIENT_POINTS") {
                            Alert.alert("Thất bại", "Điểm tích lũy của bạn không đủ để đổi quà này.");
                        } else {
                            Alert.alert("Lỗi giao dịch", "Đã xảy ra lỗi hệ thống, vui lòng thử lại.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* SỬ DỤNG CUSTOM HEADER TỪ COMPONENT */}
            <CustomHeader title="Cửa hàng xanh" />

            <View style={styles.header}>
                <Text style={styles.currentPointsLabel}>Điểm tích lũy hiện tại:</Text>
                <View style={styles.pointsDisplay}>
                    <Text style={styles.pointsValue}>{userPoints}</Text>
                    <Ionicons name="sparkles" size={24} color="#FF9800" />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F847C" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Đang tải cửa hàng...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {rewards.length === 0 ? (
                        <Text style={styles.emptyText}>Cửa hàng hiện đang hết hàng.</Text>
                    ) : (
                        rewards.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                item={reward}
                                userPoints={userPoints}
                                onExchange={handleExchange}
                            />
                        ))
                    )}
                </ScrollView>
            )}

            {/* Overlay chỉ hiện khi đang xử lý giao dịch */}
            {isExchanging && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.overlayText}>Đang xử lý giao dịch...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    currentPointsLabel: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Nunito-Regular'
    },
    pointsDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsValue: {
        fontSize: 28,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginRight: 8
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 40
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#999'
    },
    // Reward Card Styles
    rewardCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 15,
        overflow: 'hidden',
        flexDirection: width > 500 ? 'row' : 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    rewardImage: {
        width: '100%',
        height: width > 500 ? 180 : 200,
        resizeMode: 'cover',
        ...(width > 500 && { width: '40%', height: 'auto' })
    },
    rewardContent: {
        padding: 15,
        flex: 1
    },
    rewardTitle: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        marginBottom: 8,
        color: '#333'
    },
    rewardDescription: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
        color: '#666',
        marginBottom: 10
    },
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    costText: {
        fontSize: 20,
        fontFamily: 'Nunito-Bold',
        color: '#FF9800',
        marginLeft: 8
    },
    exchangeButton: {
        backgroundColor: '#2F847C',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center'
    },
    exchangeButtonDisabled: {
        backgroundColor: '#B2DFDB'
    },
    exchangeButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Nunito-Bold'
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
    },
    overlayText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16
    }
});

export default StoreScreen;