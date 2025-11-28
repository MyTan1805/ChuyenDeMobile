// src/features/community/screens/CommunityScreen.js

import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    SafeAreaView, 
    StatusBar,
    Platform,
    ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/config/firebaseConfig'; // Import DB
import { ref, onValue } from 'firebase/database'; // Import DB functions

const CommunityScreen = () => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [dailyTip, setDailyTip] = useState(null); // State lưu gợi ý hàng ngày
    const [loadingTip, setLoadingTip] = useState(true); // State loading cho gợi ý

    // --- LOGIC FETCH VÀ CHỌN GỢI Ý NGẪU NHIÊN (FR-11.1.3) ---
    useEffect(() => {
        const tipsRef = ref(database, 'daily_tips');
        const unsubscribe = onValue(tipsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && typeof data === 'object') {
                const tipsArray = Object.values(data);
                if (tipsArray.length > 0) {
                    // Chọn một gợi ý ngẫu nhiên
                    const randomTip = tipsArray[Math.floor(Math.random() * tipsArray.length)];
                    setDailyTip(randomTip.text);
                } else {
                    setDailyTip("Hãy hành động xanh để bảo vệ môi trường hôm nay!");
                }
            } else {
                 setDailyTip("Không thể tải gợi ý. Vui lòng kiểm tra Firebase.");
            }
            setLoadingTip(false);
        }, (error) => {
            console.error("Lỗi đọc Daily Tips:", error);
            setDailyTip("Lỗi kết nối khi tải gợi ý.");
            setLoadingTip(false);
        });

        return () => unsubscribe();
    }, []);

    // Dữ liệu giả lập cho danh mục (Giữ nguyên)
    const categories = [
        { 
            id: 'waste', 
            title: 'Phân loại\nrác', 
            icon: 'recycle', 
            iconLib: 'MaterialCommunityIcons',
            screen: 'WasteClassification' 
        },
        { 
            id: 'diy', 
            title: 'Tái chế &\nDIY', 
             icon: 'construct-outline',
            iconLib: 'Ionicons', 
            screen: null 
        },
        { 
            id: 'green', 
            title: 'Sống xanh', 
            icon: 'leaf', 
            iconLib: 'Ionicons',
            screen: null 
        },
        { 
            id: 'quiz', 
            title: 'Thử thách', 
            icon: 'game-controller', 
            iconLib: 'Ionicons',
            screen: 'QuizCollection' 
        },
        { 
            id: 'library', 
            title: 'Thư viện\nKiến thức', 
            icon: 'book-outline', 
            iconLib: 'Ionicons',
            screen: 'EcoLibrary' 
        },
    ];

    // --- 1. HEADER SECTION (Giữ nguyên) ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Nút Menu trái */}
            <TouchableOpacity onPress={() => alert('Mở Menu')}>
                <Ionicons name="menu-outline" size={30} color="#333" />
            </TouchableOpacity>

            {/* Thanh tìm kiếm ở giữa */}
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color="#666" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm"
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Nút Thông báo phải */}
            <TouchableOpacity onPress={() => alert('Mở Thông báo')}>
                <Ionicons name="notifications-outline" size={28} color="#000" />
            </TouchableOpacity>
        </View>
    );

    // --- 2. DAILY TIP SECTION (FR-11.1.3) ---
    const renderDailyTip = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gợi ý cho hôm nay</Text>
            <View style={styles.tipBox}>
                <View style={styles.tipIcon}>
                    <Ionicons name="bulb-outline" size={24} color="#333" />
                </View>
                {loadingTip ? (
                     <ActivityIndicator size="small" color="#2F847C" />
                ) : (
                    <Text style={styles.tipText}>
                        {dailyTip}
                    </Text>
                )}
            </View>
        </View>
    );

    // --- 3. QUIZ BANNER (FR-11.1.2 - Giữ nguyên) ---
    const renderQuizBanner = () => (
        <View style={styles.quizBanner}>
            <Text style={styles.quizText}>
                Bạn có phải là một 'Chiến binh môi trường'?
            </Text>
            <TouchableOpacity 
                style={styles.playButton}
                onPress={() => navigation.navigate('QuizCollection')}
            >
                <Text style={styles.playButtonText}>Chơi ngay</Text>
            </TouchableOpacity>
        </View>
    );

    // --- 4. CATEGORIES SECTION (FR-11.1.1 - Giữ nguyên) ---
    const renderCategories = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.catScrollContent}
            >
                {categories.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.catCard}
                        activeOpacity={0.9} 
                        onPress={() => {
                            if (item.screen) {
                                navigation.navigate(item.screen);
                            } else {
                                alert(`Đang phát triển: ${item.title}`);
                            }
                        }}
                    >
                        {/* Vòng tròn nền cho Icon */}
                        <View style={styles.catIconCircle}>
                            {item.iconLib === 'MaterialCommunityIcons' ? (
                                <MaterialCommunityIcons name={item.icon} size={28} color="#2F847C" />
                            ) : (
                                <Ionicons name={item.icon} size={28} color="#2F847C" />
                            )}
                        </View>
                        
                        {/* Tiêu đề */}
                        <Text style={styles.catTitle}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {renderDailyTip()}
                {renderQuizBanner()}
                {renderCategories()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0', 
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginHorizontal: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        color: '#000',
        marginBottom: 12,
    },
    // Daily Tip Styles
    tipBox: {
        backgroundColor: '#F0F4C3', 
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#8BC34A',
        minHeight: 60, // Đảm bảo chiều cao tối thiểu khi loading
    },
    tipIcon: {
        marginRight: 12,
    },
    tipText: {
        flex: 1,
        fontFamily: 'Nunito-Regular',
        fontSize: 15,
        color: '#333',
        lineHeight: 20,
    },
    // Quiz Banner Styles
    quizBanner: {
        backgroundColor: '#7B61FF', 
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 25,
        elevation: 5,
    },
    quizText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 20,
        textAlign: 'center',
        color: '#fff',
        marginBottom: 16,
        lineHeight: 28,
    },
    playButton: {
        backgroundColor: '#FFEB3B', 
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    playButtonText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 18,
        color: '#333',
    },
    // Categories Styles
    catScrollContent: {
        paddingHorizontal: 4, 
        paddingBottom: 10,
    },
    catCard: {
        backgroundColor: '#FFFFFF', 
        width: 100,                 
        height: 110,
        borderRadius: 16,
        marginRight: 15,            
        alignItems: 'center',       
        justifyContent: 'center',   
        shadowColor: "#2F847C",     
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,               
    },
    catIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0F2F1', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    catTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        lineHeight: 18, 
    },
});

export default CommunityScreen;