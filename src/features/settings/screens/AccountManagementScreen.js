import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';

const AccountManagementScreen = ({ navigation }) => {
    const { deleteUserAccount, resetUserData } = useUserStore();
    const [loading, setLoading] = useState(false);

    // Xử lý Xóa toàn bộ dữ liệu (Giữ tài khoản)
    const handleResetData = () => {
        Alert.alert(
            "Xóa dữ liệu cá nhân",
            "Toàn bộ hồ sơ, thành tích, lịch sử hoạt động sẽ bị đặt lại về 0. Bạn vẫn giữ được tài khoản đăng nhập. Bạn có chắc chắn không?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xóa Dữ Liệu",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        const result = await resetUserData();
                        setLoading(false);
                        if (result.success) {
                            Alert.alert("Thành công", "Dữ liệu của bạn đã được đặt lại về mặc định.");
                        } else {
                            Alert.alert("Lỗi", "Không thể xóa dữ liệu. Vui lòng thử lại.");
                        }
                    }
                }
            ]
        );
    };

    // Xử lý Xóa tài khoản vĩnh viễn
    const handleDeleteAccount = () => {
        Alert.alert(
            "Xác nhận xóa tài khoản",
            "Hành động này không thể hoàn tác. Tài khoản và mọi dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xóa Vĩnh Viễn",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        const result = await deleteUserAccount();
                        setLoading(false);
                        if (!result.success) {
                            // Firebase yêu cầu đăng nhập lại nếu phiên làm việc quá cũ để xóa tài khoản
                            Alert.alert("Yêu cầu bảo mật", "Vui lòng đăng xuất và đăng nhập lại để thực hiện hành động xóa tài khoản.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Quản lý tài khoản" showBackButton={true} />

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2F847C" />
                </View>
            )}

            <View style={styles.content}>
                {/* 1. Đổi mật khẩu */}
                <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChangePasswordSettings')}>
                    <Text style={styles.itemText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                {/* 2. Xóa toàn bộ dữ liệu (Reset) */}
                <TouchableOpacity style={styles.item} onPress={handleResetData}>
                    <Text style={styles.itemText}>Xóa toàn bộ dữ liệu (Reset)</Text>
                    <Ionicons name="refresh-circle-outline" size={24} color="#FF9800" />
                </TouchableOpacity>

                {/* 3. Xóa tài khoản */}
                <TouchableOpacity style={[styles.item, styles.deleteItem]} onPress={handleDeleteAccount}>
                    <Text style={[styles.itemText, { color: 'white' }]}>Xóa tài khoản vĩnh viễn</Text>
                    <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    item: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 15
    },
    deleteItem: {
        backgroundColor: '#FF5252', // Màu đỏ cảnh báo
        marginTop: 20
    },
    itemText: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333' },
    loadingOverlay: {
        position: 'absolute', top: 60, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center', alignItems: 'center', zIndex: 99
    }
});

export default AccountManagementScreen;