import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const shortcuts = [
    { label: 'Báo cáo vi phạm', screen: 'Báo cáo' },
    { label: 'Phân loại rác', screen: 'Phân loại rác' }, // Tên màn hình trong Navigator
    { label: 'AI Chatbot', screen: 'Chatbot' },
    { label: 'Bản đồ', screen: 'Bản đồ' },
    { label: 'Huy hiệu', screen: 'Hồ sơ' }, // Dẫn về hồ sơ để xem huy hiệu
    { label: 'Hướng dẫn', screen: 'Học tập' },
];

const AppShortcuts = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ứng dụng</Text>
            <View style={styles.grid}>
                {shortcuts.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.item}
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        {/* Có thể thêm Icon ở đây */}
                        <Text style={styles.label}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 30 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    item: {
        width: '31%', // 3 cột
        aspectRatio: 1, // Hình vuông
        backgroundColor: '#E8E8E8',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        padding: 5,
    },
    label: { textAlign: 'center', fontSize: 12, fontWeight: '500', color: '#333' },
});

export default AppShortcuts;