import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native'; // <-- Thêm Linking, Alert
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';

const SettingsItem = ({ icon, title, onPress, isDestructive = false }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={styles.itemLeft}>
            <View style={styles.iconWrapper}>
                <Ionicons name={icon} size={22} color="#333" />
            </View>
            <Text style={[styles.itemText, isDestructive && { color: 'red' }]}>{title}</Text>
        </View>
        {!isDestructive && <Ionicons name="chevron-forward" size={20} color="#999" />}
    </TouchableOpacity>
);

const SectionTitle = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

const SettingsScreen = ({ navigation }) => {
    const logout = useUserStore(state => state.logout);

    // Hàm xử lý gửi email phản hồi
    const handleSupport = () => {
        const email = 'support@ecomate.com'; // Email nhận phản hồi
        const subject = '[EcoMate] Yêu cầu hỗ trợ người dùng';
        const body = 'Xin chào đội ngũ EcoMate,\n\nTôi cần hỗ trợ về vấn đề sau:\n\n';

        // Tạo đường dẫn mailto
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    Alert.alert('Lỗi', 'Thiết bị của bạn không hỗ trợ gửi email hoặc không có ứng dụng Email.');
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Cài đặt" showBackButton={true} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <SectionTitle title="Chung" />
                <SettingsItem icon="person-circle-outline" title="Quản lý tài khoản" onPress={() => navigation.navigate('AccountManagement')} />

                <SectionTitle title="Cài đặt thông báo" />
                <SettingsItem icon="warning-outline" title="Ngưỡng cảnh báo AQI" onPress={() => navigation.navigate('AQISettings')} />
                <SettingsItem icon="notifications-outline" title="Thông báo đẩy" onPress={() => navigation.navigate('NotificationSettings')} />

                <SectionTitle title="Quyền riêng tư & Bảo mật" />
                <SettingsItem icon="shield-checkmark-outline" title="Quản lý chia sẻ vị trí" onPress={() => navigation.navigate('PrivacyLocation')} />

                <SectionTitle title="Lịch sử hoạt động" />
                <SettingsItem icon="time-outline" title="Lịch sử báo cáo vi phạm" onPress={() => navigation.navigate('ReportHistory')} />
                <SettingsItem icon="chatbubble-ellipses-outline" title="Lịch sử với Chatbot" onPress={() => navigation.navigate('ChatbotHistory')} />

                <SectionTitle title="Giới thiệu & Trợ giúp" />
                {/* --- ĐÃ CẬP NHẬT LOGIC NAVIGATION --- */}
                <SettingsItem
                    icon="information-circle-outline"
                    title="Về ứng dụng"
                    onPress={() => navigation.navigate('AboutApp')}
                />
                <SettingsItem
                    icon="document-text-outline"
                    title="Điều khoản dịch vụ"
                    onPress={() => navigation.navigate('TermsOfService')}
                />
                <SettingsItem
                    icon="lock-closed-outline"
                    title="Chính sách bảo mật"
                    onPress={() => navigation.navigate('PrivacyPolicy')}
                />
                <SettingsItem
                    icon="mail-outline"
                    title="Gửi phản hồi / Hỗ trợ"
                    onPress={handleSupport} // Gọi hàm gửi mail
                />

                <View style={{ height: 20 }} />
                <SettingsItem icon="log-out-outline" title="Đăng xuất" onPress={logout} isDestructive={true} />
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    content: { padding: 16 },
    sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333', marginTop: 15, marginBottom: 10 },
    itemContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#E0E0E0', padding: 16, borderRadius: 12, marginBottom: 10
    },
    itemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: { width: 35, alignItems: 'center', marginRight: 5 },
    itemText: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333' },
});

export default SettingsScreen;