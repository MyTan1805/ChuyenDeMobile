import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useUserStore } from '@/store/userStore'; // Import Store
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = ({ title, data = [] }) => {
    // Nếu không có dữ liệu (length = 0), hiển thị thông báo
    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <CustomHeader title={title} showBackButton={true} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có dữ liệu lịch sử (0)</Text>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name || "Không có tên"}</Text>
            </View>
            <Text style={styles.time}>{item.time || "--:--"}</Text>
            <Ionicons name="ellipsis-vertical" size={20} color="#999" />
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title={title} showBackButton={true} />
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 10 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D9D9D9', marginRight: 15 },
    info: { flex: 1 },
    name: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333' },
    time: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#999', marginRight: 10 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 10, fontFamily: 'Nunito-Regular', color: '#999', fontSize: 16 }
});

export default function ReportHistoryScreen() {
    const { userProfile } = useUserStore();
    const historyData = userProfile?.reportHistory || [];

    return <HistoryScreen title="Lịch sử báo cáo" data={historyData} />;
}