import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons'; 
import CustomHeader from '@/components/CustomHeader';

// Import Auth
import { auth } from '../../../config/firebaseConfig';

// --- CẤU HÌNH ADMIN ---
const ADMIN_IDS = [
    "vwrq5A3RsdW7vBPFodbSVfz75B93", 
    "rMWE0wFBdnVGWYoxYbNo3uhLxJ73" 
];

const { width } = Dimensions.get('window');
const SPACING = 15; 
const PADDING = 20; 
const ITEM_WIDTH = (width - (PADDING * 2) - (SPACING * 2)) / 3;

const HomeScreen = ({ navigation }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user && ADMIN_IDS.includes(user.uid)) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });
        return unsubscribe;
    }, []);

    const baseFeatures = [
        { 
            id: 1, label: 'Báo cáo vi phạm', icon: 'report-problem', iconFamily: MaterialIcons, route: 'CreateReport', bgColor: '#e0e0e0', 
        },
        { 
            id: 2, label: 'Phân loại rác thải', icon: 'recycle', iconFamily: FontAwesome5, route: 'WasteClassification', bgColor: '#e0e0e0',
        },
        { 
            id: 3, label: 'AI Chatbot', icon: 'robot', iconFamily: FontAwesome5, route: 'Chatbot', bgColor: '#e0e0e0',
        },
        { 
            id: 4, label: 'Bản đồ môi trường', icon: 'map-outline', iconFamily: Ionicons, route: 'EnvironmentalMap', bgColor: '#e0e0e0',
        },
        { 
            id: 5, label: 'Huy hiệu', icon: 'medal', iconFamily: FontAwesome5, route: null, bgColor: '#e0e0e0',
        },
        { 
            id: 6, label: 'Hướng dẫn xử lý rác', icon: 'book-open', iconFamily: FontAwesome5, route: null, bgColor: '#e0e0e0',
        },
    ];

    // [LOGIC QUAN TRỌNG] Chỉ thêm Analytics nếu là Admin
    const featuresToDisplay = isAdmin ? [
        ...baseFeatures,
        { 
            id: 7, // ID riêng cho Admin
            label: 'Phân tích & Báo cáo', 
            icon: 'analytics', 
            iconFamily: MaterialIcons, 
            route: 'Analytics', 
            bgColor: '#D1F2EB', // Màu xanh nhạt để nổi bật
        }
    ] : baseFeatures;

    const handlePressFeature = (feature) => {
        if (feature.route) {
            navigation.navigate(feature.route);
        } else {
            Alert.alert("Thông báo", `Tính năng "${feature.label}" đang được phát triển!`);
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader useLogo={true} showMenuButton={true} showNotificationButton={true} onMenuPress={() => Alert.alert('Menu pressed!')} onNotificationPress={() => Alert.alert('Notification pressed!')} />
            
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Ứng dụng</Text>

                    <View style={styles.gridContainer}>
                        {featuresToDisplay.map((item) => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={[
                                    styles.gridItem, 
                                    { width: ITEM_WIDTH, height: ITEM_WIDTH },
                                    // Style đặc biệt cho nút Admin
                                    item.id === 7 && { backgroundColor: '#E8F8F5', borderColor: '#2F847C', borderWidth: 1 } 
                                ]}
                                onPress={() => handlePressFeature(item)}
                            >
                                <View style={styles.iconWrapper}>
                                    <item.iconFamily 
                                        name={item.icon} 
                                        size={24} 
                                        color={item.id === 7 ? "#2F847C" : "#333"} 
                                    />
                                </View>
                                <Text 
                                    style={[
                                        styles.gridLabel,
                                        item.id === 7 && { color: '#2F847C', fontWeight: 'bold' }
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <Text style={{ textAlign: 'center', color: '#999' }}>
                            {isAdmin ? "Chế độ Quản trị viên đang bật" : "Chung tay bảo vệ hành tinh xanh"}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollView: { flex: 1 },
    content: { padding: PADDING },
    sectionTitle: { fontSize: 20, fontWeight: '500', color: '#000', marginBottom: 15 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING },
    gridItem: { backgroundColor: '#e0e0e0', borderRadius: 12, marginBottom: SPACING, justifyContent: 'center', alignItems: 'center', padding: 5 },
    iconWrapper: { marginBottom: 8 },
    gridLabel: { fontSize: 12, color: '#000', textAlign: 'center', fontWeight: '400', paddingHorizontal: 2 }
});

export default HomeScreen;