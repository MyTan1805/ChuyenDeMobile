import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({
    title,
    useLogo = false,
    showBackButton = false,
    showCloseButton = false,
    showMenuButton = false,
    showNotificationButton = false,
    showSettingsButton = false,
    rightIconName = "settings-outline",
    onBackPress,
    onClosePress,
    onMenuPress,
    onNotificationPress,
    onSettingsPress,
    style
}) => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    const handleClosePress = () => {
        if (onClosePress) {
            onClosePress();
        } else {
            navigation.goBack();
        }
    };

    const renderLeft = () => {
        if (showBackButton) {
            return (
                <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
            );
        }
        if (showCloseButton) {
            return (
                <TouchableOpacity onPress={handleClosePress} style={styles.iconButton}>
                    <Ionicons name="close" size={30} color="#333" />
                </TouchableOpacity>
            );
        }
        if (showMenuButton) {
            return (
                <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                    <Ionicons name="menu" size={32} color="#333" />
                </TouchableOpacity>
            );
        }
        return <View style={styles.placeholder} />;
    };

    const renderCenter = () => {
        if (useLogo) {
            return <Text style={styles.logo}>EcoMate</Text>;
        }
        return <Text style={styles.title} numberOfLines={1}>{title}</Text>;
    };

    const renderRight = () => {
        return (
            <View style={styles.rightContainer}>
                {showNotificationButton && (
                    <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={26} color="#333" />
                    </TouchableOpacity>
                )}
                {showSettingsButton && (
                    <TouchableOpacity onPress={onSettingsPress} style={[styles.iconButton, { marginLeft: 10 }]}>
                        <Ionicons name={rightIconName} size={26} color="#333" />
                    </TouchableOpacity>
                )}
                {!showNotificationButton && !showSettingsButton && <View style={styles.placeholder} />}
            </View>
        );
    };

    return (
        <View style={[styles.safeAreaWrapper, style]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.leftWrapper}>{renderLeft()}</View>
                    <View style={styles.centerWrapper}>{renderCenter()}</View>
                    <View style={styles.rightWrapper}>{renderRight()}</View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeAreaWrapper: {
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 3,
        zIndex: 10,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    safeArea: {
        backgroundColor: 'white',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
    },
    leftWrapper: {
        flex: 1,
        alignItems: 'flex-start',
    },
    centerWrapper: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightWrapper: {
        flex: 1,
        alignItems: 'flex-end',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        color: '#333',
        fontFamily: 'Nunito-Bold',
        textAlign: 'center',
    },
    logo: {
        fontSize: 26,
        color: '#2F847C',
        fontFamily: 'LogoFont',
    },
    iconButton: {
        padding: 4,
    },
    placeholder: {
        width: 28,
    }
});

export default CustomHeader;