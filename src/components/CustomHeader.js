import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({
    title,
    useLogo = false,
    showBackButton = false,
    showNotificationButton = false,
    showSettingsButton = false,
    rightIconName = "settings-outline",
    onBackPress,
    onNotificationPress,
    onSettingsPress,
    style
}) => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        if (onBackPress) onBackPress();
        else navigation.goBack();
    };

    return (
        <View style={[styles.safeAreaWrapper, style]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* LEFT */}
                    <View style={styles.leftWrapper}>
                        {showBackButton && (
                            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* CENTER */}
                    <View style={styles.centerWrapper}>
                        {useLogo ? (
                            <Text style={styles.logo}>EcoMate</Text>
                        ) : (
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        )}
                    </View>

                    {/* RIGHT */}
                    <View style={styles.rightWrapper}>
                        <View style={styles.rightContainer}>
                            {showSettingsButton && (
                                <TouchableOpacity onPress={onSettingsPress} style={[styles.notiBtn, { marginRight: 10 }]}>
                                    <Ionicons name={rightIconName} size={22} color="#2F847C" />
                                </TouchableOpacity>
                            )}
                            
                            {showNotificationButton && (
                                <TouchableOpacity onPress={onNotificationPress} style={styles.notiBtn}>
                                    <Ionicons name="notifications-outline" size={22} color="#2F847C" />
                                    <View style={styles.badge} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeAreaWrapper: {
        backgroundColor: '#F7F9FC', 
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        zIndex: 10,
    },
    safeArea: { backgroundColor: 'transparent' },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 20,
    },
    leftWrapper: { flex: 1, alignItems: 'flex-start' },
    centerWrapper: { flex: 3, alignItems: 'center', justifyContent: 'center' },
    rightWrapper: { flex: 1, alignItems: 'flex-end' },
    rightContainer: { flexDirection: 'row', alignItems: 'center' },
    
    title: { fontSize: 18, color: '#333', fontFamily: 'Nunito-Bold' },
    logo: { fontSize: 24, color: '#2F847C', fontFamily: 'LogoFont' },
    
    notiBtn: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#2F847C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    badge: {
        position: 'absolute',
        top: 10, right: 10,
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        borderWidth: 1,
        borderColor: '#fff'
    },
    iconButton: { padding: 5 }
});

export default CustomHeader;