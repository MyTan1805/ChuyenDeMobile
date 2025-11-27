import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

const MOCK_NOTIFICATIONS = [
    { id: '1', type: 'campaign', title: 'Chiến dịch Chủ Nhật Xanh 🌿', body: 'Dọn dẹp Hồ Gươm 8:00 sáng nay.', time: '2 giờ trước', read: false },
    { id: '2', type: 'trash', title: 'Nhắc nhở thu gom rác ♻️', body: 'Hôm nay có lịch thu gom rác tái chế.', time: '5 giờ trước', read: true },
    { id: '3', type: 'weather', title: 'Cảnh báo bụi mịn PM2.5 😷', body: 'AQI 165 (Kém). Đeo khẩu trang khi ra ngoài.', time: '1 ngày trước', read: true }
];

const NotificationListScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const handlePress = (item) => {
        // Điều hướng tương tác
        if (item.type === 'weather') navigation.navigate('AqiDetail');
        if (item.type === 'campaign') navigation.navigate('MainTabs', { screen: 'Cộng đồng' });
        
        // Đánh dấu đã đọc
        setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, !item.read && styles.unread]} onPress={() => handlePress(item)}>
            <Ionicons name="notifications" size={24} color="#2F847C" style={{ marginRight: 15 }} />
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Thông báo" showBackButton={true} />
            <FlatList data={notifications} renderItem={renderItem} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    card: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
    unread: { borderLeftWidth: 4, borderLeftColor: '#2F847C' },
    title: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
    body: { color: '#555', fontSize: 14 },
    time: { color: '#999', fontSize: 12, marginTop: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' }
});

export default NotificationListScreen;