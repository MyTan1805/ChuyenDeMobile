import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const shortcuts = [
    { 
        id: 1, 
        label: 'Báo cáo vi phạm', 
        screen: 'CreateReport', // ✅ SỬA: Trỏ đúng tên màn hình của bạn Bảo
        icon: 'alert-circle-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 2, 
        label: 'Phân loại rác', 
        screen: 'WasteClassification', // Đã làm
        icon: 'trash-can-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 3, 
        label: 'AI Chatbot', 
        screen: 'Chatbot', // Đã làm
        icon: 'robot-happy-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 4, 
        label: 'Bản đồ MT', 
        screen: 'Map', // Của Bảo (Chưa có code thì để tạm)
        icon: 'map-outline', 
        lib: Ionicons 
    },
    { 
        id: 5, 
        label: 'Huy hiệu', 
        screen: 'ProfileMain', // Trỏ về Tab Hồ sơ
        icon: 'medal-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 6, 
        label: 'Tra cứu rác', 
        screen: 'WasteSearch', // Màn hình 3.2 của Tân
        icon: 'book-open-variant', 
        lib: MaterialCommunityIcons 
    },
];

const AppShortcuts = () => {
    const navigation = useNavigation();

    const handlePress = (item) => {
        if (item.screen) {
            // Kiểm tra xem màn hình đó có trong Navigator chưa (để tránh crash)
            try {
                navigation.navigate(item.screen);
            } catch (error) {
                console.error(error);
                Alert.alert("Thông báo", `Chức năng "${item.label}" đang được hoàn thiện.`);
            }
        } else {
            Alert.alert("Thông báo", `Chức năng "${item.label}" đang phát triển.`);
        }
    };

    return (
        <View style={styles.grid}>
            {shortcuts.map((item, index) => {
                const IconTag = item.lib;
                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.item}
                        onPress={() => handlePress(item)}
                    >
                        <View style={styles.iconBox}>
                            <IconTag name={item.icon} size={28} color="#555" />
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
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
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
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