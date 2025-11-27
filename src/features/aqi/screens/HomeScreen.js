import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons'; 
// Đảm bảo đường dẫn import CustomHeader đúng với dự án của bạn
// Nếu báo lỗi, hãy thử đổi thành '../../components/CustomHeader' hoặc '../components/CustomHeader'
import CustomHeader from '@/components/CustomHeader';

// Tính toán kích thước ô lưới để chia đều 3 cột
const { width } = Dimensions.get('window');
const SPACING = 15; // Khoảng cách giữa các ô
const PADDING = 20; // Padding 2 bên màn hình
// Công thức: (Chiều rộng màn hình - Padding 2 bên - Khoảng cách giữa 2 khe) chia 3
const ITEM_WIDTH = (width - (PADDING * 2) - (SPACING * 2)) / 3;

const HomeScreen = ({ navigation }) => {

    // Danh sách tính năng (Giống trong ảnh)
    const FEATURES = [
        { 
            id: 1, 
            label: 'Báo cáo vi phạm', 
            icon: 'report-problem', 
            iconFamily: MaterialIcons, 
            route: 'CreateReport', // Tên màn hình trong Navigator
            bgColor: '#e0e0e0', // Màu nền xám nhạt như ảnh
        },
        { 
            id: 2, 
            label: 'Phân loại rác thải', 
            icon: 'recycle', 
            iconFamily: FontAwesome5, 
            route: null,
            bgColor: '#e0e0e0',
        },
        { 
            id: 3, 
            label: 'AI Chatbot', 
            icon: 'robot', 
            iconFamily: FontAwesome5, 
            route: null,
            bgColor: '#e0e0e0',
        },
        { 
            id: 4, 
            label: 'Bản đồ môi trường', 
            icon: 'map-outline', 
            iconFamily: Ionicons, 
            route: null,
            bgColor: '#e0e0e0',
        },
        { 
            id: 5, 
            label: 'Huy hiệu', 
            icon: 'medal', 
            iconFamily: FontAwesome5, 
            route: null,
            bgColor: '#e0e0e0',
        },
        { 
            id: 6, 
            label: 'Hướng dẫn xử lý rác', 
            icon: 'book-open', 
            iconFamily: FontAwesome5, 
            route: null,
            bgColor: '#e0e0e0',
        },
    ];

    const handlePressFeature = (feature) => {
        if (feature.route) {
            // Điều hướng nếu có route
            navigation.navigate(feature.route);
        } else {
            // Thông báo nếu tính năng chưa làm
            Alert.alert("Thông báo", `Tính năng "${feature.label}" đang được phát triển!`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header cũ của bạn */}
            <CustomHeader
                useLogo={true}
                showMenuButton={true}
                showNotificationButton={true}
                onMenuPress={() => Alert.alert('Menu pressed!')}
                onNotificationPress={() => Alert.alert('Notification pressed!')}
            />
            
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {/* Tiêu đề Section */}
                    <Text style={styles.sectionTitle}>Ứng dụng</Text>

                    {/* Lưới chức năng (Grid Layout) */}
                    <View style={styles.gridContainer}>
                        {FEATURES.map((item) => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={[styles.gridItem, { width: ITEM_WIDTH, height: ITEM_WIDTH }]}
                                onPress={() => handlePressFeature(item)}
                            >
                                {/* Icon */}
                                <View style={styles.iconWrapper}>
                                    <item.iconFamily name={item.icon} size={24} color="#333" />
                                </View>
                                
                                {/* Text */}
                                <Text style={styles.gridLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Khu vực nội dung khác bên dưới (nếu có) */}
                    <View style={{ marginTop: 30 }}>
                        <Text style={{ textAlign: 'center', color: '#999' }}>
                            Thêm các nội dung khác của trang chủ ở đây...
                        </Text>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: PADDING,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '500', // Font mảnh vừa phải giống ảnh
        color: '#000',
        marginBottom: 15,
    },
    // Grid Styles
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Tự động đẩy các ô ra 2 biên
        gap: SPACING, // (Chỉ hoạt động trên React Native mới), nếu lỗi layout dùng marginBottom ở dưới
    },
    gridItem: {
        backgroundColor: '#e0e0e0', // Màu nền xám như thiết kế
        borderRadius: 12,
        marginBottom: SPACING, // Khoảng cách dòng
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    iconWrapper: {
        marginBottom: 8,
    },
    gridLabel: {
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
        fontWeight: '400',
        paddingHorizontal: 2,
    }
});

export default HomeScreen;