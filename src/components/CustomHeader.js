import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ 
    title,                  // Tiêu đề dạng text, vd: "Thông báo"
    useLogo = false,        // Đặt là true nếu muốn hiển thị logo "EcoMate"
    showBackButton = false, // Hiển thị nút quay lại
    showMenuButton = false, // Hiển thị nút menu
    showNotificationButton = false, // Hiển thị nút chuông
    onBackPress,            // Hàm tùy chỉnh khi nhấn nút quay lại
    onMenuPress,            // Hàm tùy chỉnh khi nhấn nút menu
    onNotificationPress,    // Hàm tùy chỉnh khi nhấn nút chuông
    
}) => {
    const navigation = useNavigation();

    // Xử lý sự kiện nhấn nút quay lại mặc định
    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    const renderLeft = () => {
        if (showBackButton) {
            return (
                <TouchableOpacity onPress={handleBackPress}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
            );
        }
        if (showMenuButton) {
            return (
                <TouchableOpacity onPress={onMenuPress}>
                    <Ionicons name="menu" size={32} color="black" />
                </TouchableOpacity>
            );
        }
        return <View />; // Trả về View rỗng để giữ layout
    };

    const renderCenter = () => {
        if (useLogo) {
            return <Text style={styles.logo}>EcoMate</Text>;
        }
        return <Text style={styles.title}>{title}</Text>;
    };

    const renderRight = () => {
        if (showNotificationButton) {
            return (
                <TouchableOpacity onPress={onNotificationPress}>
                    <Ionicons name="notifications-outline" size={26} color="black" />
                </TouchableOpacity>
            );
        }
        return <View />; // Trả về View rỗng để giữ layout
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>{renderLeft()}</View>
                <View style={styles.centerContainer}>{renderCenter()}</View>
                <View style={styles.rightContainer}>{renderRight()}</View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: 'white',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    leftContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Nunito-Bold', // Sử dụng font bạn đã import
    },
    logo: {
        fontSize: 26,
        color: 'black',
        fontFamily: 'LogoFont', 
    },
});

export default CustomHeader;