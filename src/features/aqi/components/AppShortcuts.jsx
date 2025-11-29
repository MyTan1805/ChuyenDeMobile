import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const shortcuts = [
    { 
        id: 1, 
        label: 'Báo cáo vi phạm', 
        screen: 'CreateReport', 
        icon: 'alert-circle-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 2, 
        label: 'Phân loại rác', 
        screen: 'WasteClassification', // ✅ Tên màn hình CHUẨN trong AppNavigator
        icon: 'trash-can-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 3, 
        label: 'AI Chatbot', 
        screen: 'Chatbot', 
        icon: 'robot-happy-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 4, 
        label: 'Tra cứu rác (AI)', 
        screen: 'WasteSearch', // ✅ Màn hình 3.2 của Tân
        icon: 'book-open-variant', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 5, 
        label: 'Huy hiệu', 
        screen: 'BadgeCollection', 
        icon: 'medal-outline', 
        lib: MaterialCommunityIcons 
    },
    { 
        id: 6, 
        label: 'Cửa hàng', 
        screen: 'MainTabs', // Nhảy sang tab Cửa hàng
        params: { screen: 'Cửa hàng' },
        icon: 'gift-outline', 
        lib: Ionicons 
    },
];

const AppShortcuts = () => {
    const navigation = useNavigation();

    const handlePress = (item) => {
        if (item.screen) {
            try {
                // Nếu có params (như nhảy sang Tab con)
                if (item.params) {
                    navigation.navigate(item.screen, item.params);
                } else {
                    navigation.navigate(item.screen);
                }
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