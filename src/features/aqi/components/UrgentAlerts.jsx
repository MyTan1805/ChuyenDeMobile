import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Icon

const mockAlerts = [
    { id: 1, type: 'warning', text: 'Cảnh báo ô nhiễm không khí cao tại khu vực Hoàn Kiếm. Cần hành động!' },
    { id: 2, type: 'info', text: 'Chiến dịch thu gom rác thải tình nguyện sắp diễn ra.' },
];

const UrgentAlerts = () => {
    return (
        <View style={styles.container}>
            {mockAlerts.map((alert) => {
                const isWarning = alert.type === 'warning';
                return (
                    <TouchableOpacity 
                        key={alert.id} 
                        style={[
                            styles.alertItem, 
                            isWarning ? styles.warningBg : styles.infoBg
                        ]}
                    >
                        <Ionicons 
                            name={isWarning ? "warning" : "notifications"} 
                            size={24} 
                            color={isWarning ? "#FF5252" : "#333"} 
                            style={styles.icon}
                        />
                        <Text style={styles.alertText}>{alert.text}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 10 },
    alertItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16, // Bo góc tròn hơn
        marginBottom: 12,
        alignItems: 'center',
    },
    warningBg: {
        backgroundColor: '#FFEBEB', // Màu nền cảnh báo (hồng nhạt)
    },
    infoBg: {
        backgroundColor: '#F5F5F5', // Màu nền thông tin (xám nhạt)
    },
    icon: { 
        marginRight: 12 
    },
    alertText: { 
        flex: 1, 
        fontSize: 14, 
        color: '#333',
        lineHeight: 20, // Giãn dòng cho dễ đọc
        fontWeight: '500'
    },
});

export default UrgentAlerts;