import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const shortcuts = [
    { 
        id: 1, 
        label: 'Báo cáo vi phạm', 
        screen: 'CreateReport', 
        icon: 'alert-circle-outline', 
        lib: MaterialCommunityIcons,
        color: '#FFEBEE', iconColor: '#D32F2F' 
    },
    { 
        id: 2, 
        label: 'Phân loại rác', 
        screen: 'WasteClassification',
        icon: 'trash-can-outline', 
        lib: MaterialCommunityIcons,
        color: '#E8F5E9', iconColor: '#2E7D32'
    },
    { 
        id: 3, 
        label: 'AI Chatbot', 
        screen: 'Chatbot', 
        icon: 'robot-happy-outline', 
        lib: MaterialCommunityIcons,
        color: '#E3F2FD', iconColor: '#1976D2'
    },
    { 
        id: 4, 
        label: 'Bản đồ xanh', 
        screen: 'EnvironmentalMap', 
        icon: 'map-search-outline', 
        lib: MaterialCommunityIcons,
        color: '#FFF3E0', iconColor: '#F57C00'
    },
    { 
        id: 5, 
        label: 'Huy hiệu', 
        screen: 'BadgeCollection', 
        icon: 'medal-outline', 
        lib: MaterialCommunityIcons,
        color: '#F3E5F5', iconColor: '#7B1FA2'
    },
    { 
        id: 6, 
        label: 'Cửa hàng', 
        screen: 'MainTabs', 
        params: { screen: 'Cửa hàng' },
        icon: 'gift-outline', 
        lib: Ionicons,
        color: '#E0F7FA', iconColor: '#0097A7'
    },
];

const AppShortcuts = () => {
    const navigation = useNavigation();

    const handlePress = (item) => {
        if (item.screen) {
            if (item.params) navigation.navigate(item.screen, item.params);
            else navigation.navigate(item.screen);
        } else {
            Alert.alert("Thông báo", "Tính năng đang phát triển.");
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
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                            <IconTag name={item.icon} size={26} color={item.iconColor} />
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
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 20,  
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: 'Nunito-Bold',
        color: '#444'
    },
});

export default AppShortcuts;