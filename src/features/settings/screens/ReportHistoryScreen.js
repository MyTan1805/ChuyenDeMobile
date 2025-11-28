import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ReportHistoryScreen = () => {
    const { userProfile, deleteReport } = useUserStore(); // Thêm deleteReport
    const navigation = useNavigation();
    const historyData = userProfile?.reportHistory || [];

    const handlePress = (reportItem) => {
        navigation.navigate('ReportDetail', { report: reportItem });
    };

    // Hàm xử lý xóa
    const handleDelete = (item) => {
        Alert.alert(
            "Xóa báo cáo",
            "Bạn có chắc chắn muốn xóa báo cáo này khỏi lịch sử?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => await deleteReport(item.id)
                }
            ]
        );
    };

    if (!historyData || historyData.length === 0) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Lịch sử báo cáo" showBackButton={true} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
            <View style={[styles.avatar, { backgroundColor: item.status === 'pending' ? '#FFF3E0' : '#E8F5E9' }]}>
                <Ionicons
                    name={item.status === 'pending' ? "hourglass-outline" : "checkmark-circle-outline"}
                    size={24}
                    color={item.status === 'pending' ? "#F57C00" : "#2E7D32"}
                />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.title || item.name}</Text>
                <Text style={styles.status}>
                    {item.status === 'pending' ? 'Đang xử lý' : 'Đã tiếp nhận'}
                </Text>
            </View>

            {/* Container bên phải chứa ngày và nút xóa */}
            <View style={styles.rightContainer}>
                <Text style={styles.time}>{item.time}</Text>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Lịch sử báo cáo" showBackButton={true} />
            <FlatList
                data={historyData}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 10 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    info: { flex: 1, marginRight: 10 },
    name: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    status: { fontSize: 12, color: '#888', marginTop: 2 },

    rightContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 40 },
    time: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#999' },
    deleteButton: { padding: 5 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 10, fontFamily: 'Nunito-Regular', color: '#999', fontSize: 16 }
});

export default ReportHistoryScreen;