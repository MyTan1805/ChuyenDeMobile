import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Platform } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useUserStore } from '@/store/userStore';
import * as Notifications from 'expo-notifications';

// ✅ ĐÃ SỬA: Cập nhật cấu hình mới nhất của Expo Notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true, // Thay thế cho shouldShowAlert
        shouldShowList: true,   // Thay thế cho shouldShowAlert
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const ToggleRow = ({ label, settingKey, initialValue, onToggle }) => {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={initialValue ? "#2F847C" : "#f4f3f4"}
                onValueChange={(val) => onToggle(settingKey, val, label)}
                value={initialValue}
            />
        </View>
    );
};

const NotificationSettingsScreen = () => {
    const { userProfile, updateUserSettings, triggerDynamicNotification } = useUserStore();

    const [settings, setSettings] = useState(userProfile?.notificationSettings || {
        weather: false,
        trash: false,
        campaign: false,
        community: false
    });

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Cần quyền', 'Vui lòng cấp quyền thông báo để sử dụng tính năng này.');
            }
        };
        requestPermissions();
    }, []);

    const handleToggle = async (key, value, label) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        await updateUserSettings({ notificationSettings: newSettings });

        if (value) {
            // key: 'weather', 'trash', 'campaign', 'community'
            await triggerDynamicNotification(key);
        } else {
            console.log(`Đã tắt thông báo: ${key}`);
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Thông báo đẩy" showBackButton={true} />
            <View style={styles.content}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>📡</Text>
                    <Text style={styles.infoText}>
                        Thông báo sẽ tự động cập nhật nội dung dựa trên dữ liệu thực tế từ hệ thống (AQI, lịch rác, sự kiện...).
                    </Text>
                </View>

                <ToggleRow
                    label="Cảnh báo thời tiết & AQI"
                    settingKey="weather"
                    initialValue={settings.weather}
                    onToggle={handleToggle}
                />
                <ToggleRow
                    label="Nhắc nhớ lịch thu gom rác"
                    settingKey="trash"
                    initialValue={settings.trash}
                    onToggle={handleToggle}
                />
                <ToggleRow
                    label="Thông báo về chiến dịch môi trường"
                    settingKey="campaign"
                    initialValue={settings.campaign}
                    onToggle={handleToggle}
                />
                <ToggleRow
                    label="Thông báo về hoạt động cộng đồng"
                    settingKey="community"
                    initialValue={settings.community}
                    onToggle={handleToggle}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    infoBox: {
        flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 15,
        borderRadius: 12, marginBottom: 20, alignItems: 'flex-start',
        borderLeftWidth: 4, borderLeftColor: '#2196F3'
    },
    infoIcon: { fontSize: 20, marginRight: 10, marginTop: 2 },
    infoText: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 14, color: '#1565C0', lineHeight: 20 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, marginBottom: 12
    },
    label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333', flex: 1, paddingRight: 10 }
});

export default NotificationSettingsScreen;