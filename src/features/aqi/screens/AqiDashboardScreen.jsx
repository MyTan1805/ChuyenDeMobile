import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AqiSummaryCard } from '../components/AqiSummaryCard'; 
// Giả sử bạn sẽ tạo thêm các component này
// import UrgentAlerts from '../components/UrgentAlerts';
// import AppShortcuts from '../components/AppShortcuts';
// import DailyActions from '../components/DailyActions';
// import CommunityPostsPreview from '../components/CommunityPostsPreview';

// Dữ liệu giả (mock data) để dựng giao diện
const mockAqiData = { level: 'Trung bình', value: 52 };
const mockAlerts = [
    { type: 'warning', text: 'Cảnh báo ô nhiễm không khí cao tại khu vực Hoàn Kiếm. Cần hành động!' },
    { type: 'info', text: 'Chiến dịch thu gom rác thải tình nguyện sắp diễn ra.' },
];

const AqiDashboardScreen = () => {
    const navigation = useNavigation();

    // Trong thực tế, bạn sẽ dùng hook useAqiData() để lấy dữ liệu thật
    // const { data: aqiData, loading } = useAqiData(); 
    const loading = false; // Tạm thời để false để hiển thị UI

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header Tùy chỉnh */}
            <View style={styles.headerContainer}>
                <TouchableOpacity>
                    {/* Icon Menu */}
                    <Text style={styles.headerIcon}>☰</Text> 
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EcoMate</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    {/* Icon Chuông */}
                    <Text style={styles.headerIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                
                {/* 1. Thẻ Chất lượng Không khí */}
                <AqiSummaryCard 
                    data={mockAqiData} 
                    loading={loading} 
                    onPress={() => navigation.navigate('AqiDetail')}
                />
                
                {/* 2. Thông báo khẩn cấp */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Thông báo khẩn cấp</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Component UrgentAlerts sẽ render danh sách mockAlerts */}
                    <View style={styles.alertItem}>
                        <Text>⚠️ Cảnh báo ô nhiễm không khí cao tại khu vực Hoàn Kiếm. Cần hành động!</Text>
                    </View>
                    <View style={styles.alertItem}>
                        <Text>🔔 Chiến dịch thu gom rác thải tình nguyện sắp diễn ra.</Text>
                    </View>
                </View>

                {/* 3. Biểu đồ (Tạm thời là ảnh hoặc component giả) */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Biểu đồ xu hướng AQI hàng tháng</Text>
                    <View style={styles.chartPlaceholder}>
                        <Text>Biểu đồ sẽ được hiển thị ở đây</Text>
                    </View>
                </View>

                {/* 4. Lối tắt Ứng dụng */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ứng dụng</Text>
                    <View style={styles.shortcutGrid}>
                        <TouchableOpacity style={styles.shortcutItem}><Text>Báo cáo vi phạm</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}><Text>Phân loại rác</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}><Text>AI Chatbot</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}><Text>Bản đồ</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}><Text>Huy hiệu</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}><Text>Hướng dẫn</Text></TouchableOpacity>
                    </View>
                </View>

                {/* 5. Gợi ý hành động xanh */}
                 <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Gợi ý hành động xanh mỗi ngày</Text>
                    <View style={styles.dailyActionsCard}>
                       {/* Nội dung gợi ý sẽ nằm ở đây */}
                       <Text>Tiến độ, các checkbox...</Text>
                    </View>
                </View>

                {/* 6. Bài viết cộng đồng */}
                 <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Bài viết cộng đồng mới nhất</Text>
                    <View style={styles.postsContainer}>
                        {/* Component CommunityPostsPreview sẽ nằm ở đây */}
                        <Text>Hai bài viết cộng đồng...</Text>
                    </View>
                </View>

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
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    headerIcon: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    sectionContainer: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAllText: {
        color: '#007AFF', // Màu xanh dương
        fontSize: 14,
    },
    alertItem: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    chartPlaceholder: {
        height: 150,
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    shortcutGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    shortcutItem: {
        width: '30%',
        height: 80,
        backgroundColor: '#E8E8E8',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    dailyActionsCard: {
      backgroundColor: '#F0F0F0',
      padding: 15,
      borderRadius: 10,
    },
    postsContainer: {
        // Tùy chỉnh layout cho phần bài viết
    },
});

export default AqiDashboardScreen;