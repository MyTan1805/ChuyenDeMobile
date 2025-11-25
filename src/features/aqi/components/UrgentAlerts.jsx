import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const mockAlerts = [
    { id: 1, type: 'warning', text: 'Cảnh báo ô nhiễm không khí cao tại khu vực Hoàn Kiếm. Cần hành động!' },
    { id: 2, type: 'info', text: 'Chiến dịch thu gom rác thải tình nguyện sắp diễn ra.' },
];

const UrgentAlerts = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Thông báo khẩn cấp</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            
            {mockAlerts.map((alert) => {
                const isWarning = alert.type === 'warning';
                return (
                    <TouchableOpacity key={alert.id} style={styles.alertItem}>
                        <Text style={styles.icon}>{isWarning ? '⚠️' : '🔔'}</Text>
                        <Text style={styles.alertText}>{alert.text}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 18, fontWeight: 'bold' },
    seeAll: { color: '#007AFF', fontSize: 14 },
    alertItem: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    icon: { fontSize: 18, marginRight: 10 },
    alertText: { flex: 1, fontSize: 14, color: '#333' },
});

export default UrgentAlerts;