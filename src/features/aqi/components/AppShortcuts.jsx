import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';

const shortcuts = [
    { label: 'Báo cáo vi phạm', screen: 'Report', icon: 'alert-circle-outline' },
    { label: 'Phân loại rác', screen: 'Recycle', icon: 'trash-can-outline' },
    { label: 'AI Chatbot', screen: 'Chatbot', icon: 'robot-happy-outline' },
    { label: 'Bản đồ MT', screen: 'Map', icon: 'map-outline' }, 
    { label: 'Huy hiệu', screen: 'Profile', icon: 'medal-outline' },
    { label: 'Hướng dẫn', screen: 'Guide', icon: 'book-open-variant' },
];

// 2. Bỏ prop { navigation } đi, ta dùng hook bên trong
const AppShortcuts = () => { 
    const navigation = useNavigation(); 

    return (
        <View style={styles.grid}>
            {shortcuts.map((item, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.item}
                    onPress={() => {
                        // Thêm log để kiểm tra
                        console.log("Navigating to:", item.screen);
                        navigation.navigate(item.screen);
                    }}
                >
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons name={item.icon} size={28} color="#555" />
                    </View>
                    <Text style={styles.label}>{item.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        marginTop: 5
    },
    item: {
        width: '31%', 
        aspectRatio: 1, 
        backgroundColor: '#F0F0F0', 
        borderRadius: 20, 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        padding: 8,
    },
    iconBox: {
        marginBottom: 8,
    },
    label: { 
        textAlign: 'center', 
        fontSize: 12, 
        fontWeight: '600', 
        color: '#444' 
    },
});

export default AppShortcuts;