import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';

const PrivacyLocationScreen = () => {
    const { userProfile, updateUserSettings } = useUserStore();
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        if (userProfile?.isLocationShared !== undefined) {
            setIsShared(userProfile.isLocationShared);
        }
    }, [userProfile]);

    const toggleSwitch = (value) => {
        setIsShared(value);
        updateUserSettings({ isLocationShared: value });
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Quản lý chia sẻ vị trí" showBackButton={true} />
            <View style={styles.content}>
                <View style={styles.infoBox}>
                    <Ionicons name="bulb-outline" size={24} color="#333" style={{ marginRight: 10 }} />
                    <Text style={styles.infoText}>
                        Cho phép người dùng bật/tắt chia sẻ vị trí GPS tự động.
                        {"\n"}(Tuân thủ FR-7.3: Không chia sẻ khi chưa đồng ý)
                    </Text>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.label}>Chia sẻ vị trí GPS tự động</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isShared ? "#2F847C" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isShared}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    infoBox: { flexDirection: 'row', backgroundColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 30, alignItems: 'center' },
    infoText: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 14, color: '#333' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E0E0E0', padding: 15, borderRadius: 10 },
    label: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333' }
});

export default PrivacyLocationScreen;