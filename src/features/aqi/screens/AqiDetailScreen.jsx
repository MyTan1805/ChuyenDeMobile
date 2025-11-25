import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    SafeAreaView, 
    TouchableOpacity, 
    Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Mock Data (Dữ liệu giả lập để dựng UI)
const aqiDetails = {
    score: 52,
    status: 'Trung bình',
    mainPollutant: 'PM2.5',
    pollutantDesc: 'Hạt bụi mịn có đường kính nhỏ hơn 2.5 µm.',
    recommendations: [
        'Nhóm nhạy cảm nên hạn chế vận động mạnh ngoài trời.',
        'Đóng cửa sổ để tránh không khí ô nhiễm bên ngoài.',
        'Sử dụng máy lọc không khí nếu có điều kiện.'
    ],
    warning: 'Nồng độ PM2.5 hiện cao gấp 2.0 lần giá trị hướng dẫn hàng năm của WHO về PM2.5'
};

const AqiDetailScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('24h'); // State cho tab lịch sử

    // --- Component con: Header ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                {/* Icon Back (Thay bằng icon thật sau này) */}
                <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EcoMate</Text>
            <TouchableOpacity style={styles.iconButton}>
                {/* Icon Chuông */}
                <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
        </View>
    );

    // --- Component con: Thẻ AQI Chính ---
    const renderMainCard = () => (
        <View style={styles.card}>
            <View style={styles.mainCardTop}>
                {/* Box điểm số */}
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreText}>{aqiDetails.score}</Text>
                    <Text style={styles.scoreLabel}>AQI VN</Text>
                </View>
                
                {/* Trạng thái */}
                <Text style={styles.statusText}>{aqiDetails.status}</Text>
                
                {/* Icon khuôn mặt (Placeholder) */}
                <View style={styles.faceIcon}>
                    <Text style={{fontSize: 24}}>😐</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.pollutantContainer}>
                <Text style={styles.pollutantLabel}>Chất gây ô nhiễm chính:</Text>
                <Text style={styles.pollutantValue}>{aqiDetails.mainPollutant}</Text>
            </View>
            
            <View style={styles.divider} />
             {/* Thêm chút padding dưới để giống wireframe */}
             <View style={{height: 10}} />
        </View>
    );

    // --- Component con: Khuyến nghị ---
    const renderRecommendations = () => (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Khuyến nghị về sức khỏe</Text>
            {aqiDetails.recommendations.map((item, index) => (
                <View key={index} style={styles.recItem}>
                    <View style={styles.recIconPlaceholder} />
                    <Text style={styles.recText}>{item}</Text>
                </View>
            ))}
        </View>
    );

    // --- Component con: Cảnh báo ---
    const renderWarning = () => (
        <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>!</Text>
            </View>
            <Text style={styles.warningText}>{aqiDetails.warning}</Text>
        </View>
    );

    // --- Component con: Lịch sử (Biểu đồ) ---
    const renderHistory = () => (
        <View style={[styles.card, {flex: 1, marginBottom: 20}]}>
            <Text style={styles.sectionTitle}>Lịch sử</Text>
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
                {['24 giờ', '7 ngày', '30 ngày'].map((tab, index) => {
                    const key = index === 0 ? '24h' : index === 1 ? '7d' : '30d';
                    const isActive = activeTab === key;
                    return (
                        <TouchableOpacity 
                            key={key} 
                            style={[styles.tabItem, isActive && styles.activeTabItem]}
                            onPress={() => setActiveTab(key)}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Placeholder cho Biểu đồ */}
            <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>bar chart of aqi ({activeTab})</Text>
                {/* Sau này sẽ nhúng thư viện chart vào đây */}
                <View style={styles.mockBarContainer}>
                    <View style={[styles.mockBar, {height: 40}]} />
                    <View style={[styles.mockBar, {height: 70}]} />
                    <View style={[styles.mockBar, {height: 50}]} />
                    <View style={[styles.mockBar, {height: 90}]} />
                    <View style={[styles.mockBar, {height: 60}]} />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {renderHeader()}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {renderMainCard()}
                {renderRecommendations()}
                {renderWarning()}
                {renderHistory()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    iconButton: {
        padding: 5,
    },
    iconText: {
        fontSize: 24,
        color: '#000',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold', // Bạn có thể thay bằng font chữ kiểu viết tay nếu muốn
        fontStyle: 'italic', 
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    // Card Styles Chung
    card: {
        backgroundColor: '#E0E0E0', // Màu xám nhạt như wireframe
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    // Main Card Styles
    mainCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    scoreBox: {
        backgroundColor: '#C0C0C0', // Xám đậm hơn chút
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        minWidth: 70,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 10,
        color: '#333',
    },
    statusText: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    faceIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 2,
        backgroundColor: '#333', // Đường kẻ đen
        marginVertical: 10,
    },
    pollutantContainer: {
        paddingVertical: 10,
    },
    pollutantLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    pollutantValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Recommendation Styles
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    recItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    recIconPlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: '#D3D3D3', // Hình vuông xám
        borderRadius: 8,
        marginRight: 15,
    },
    recText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    // Warning Styles
    warningCard: {
        backgroundColor: '#D3D3D3',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    warningIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    // History / Chart Styles
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#999',
    },
    tabItem: {
        paddingBottom: 10,
        paddingHorizontal: 10,
    },
    activeTabItem: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    chartPlaceholder: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mockBarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 20,
        marginTop: 20
    },
    mockBar: {
        width: 20,
        backgroundColor: '#888',
        borderRadius: 4
    }
});

export default AqiDetailScreen;