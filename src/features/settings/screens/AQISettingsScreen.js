import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Switch, TextInput, TouchableOpacity,
    Alert, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';

const AQISettingsScreen = () => {
    const { userProfile, updateUserSettings } = useUserStore();

    // Lấy state từ store hoặc dùng default
    const [isEnabled, setIsEnabled] = useState(userProfile?.aqiSettings?.isEnabled ?? true);
    const [threshold, setThreshold] = useState(userProfile?.aqiSettings?.threshold ?? "150");

    const [modalVisible, setModalVisible] = useState(false);
    const [tempThreshold, setTempThreshold] = useState(threshold);

    const toggleSwitch = async (value) => {
        setIsEnabled(value);
        await updateUserSettings({
            aqiSettings: { isEnabled: value, threshold: threshold }
        });
    };

    const openEditModal = () => {
        setTempThreshold(threshold);
        setModalVisible(true);
    };

    const saveThreshold = async () => {
        const num = parseInt(tempThreshold);
        if (isNaN(num) || num < 0 || num > 500) {
            Alert.alert("Lỗi", "Vui lòng nhập chỉ số AQI hợp lệ (0 - 500).");
            return;
        }
        setThreshold(tempThreshold);
        setModalVisible(false);
        await updateUserSettings({
            aqiSettings: { isEnabled: isEnabled, threshold: tempThreshold }
        });
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Ngưỡng cảnh báo" showBackButton={true} />
            <View style={styles.content}>
                <View style={styles.infoBox}>
                    <Ionicons name="sunny-outline" size={24} color="#333" style={{ marginRight: 10 }} />
                    <Text style={styles.infoText}>
                        Nhận thông báo dựa trên dữ liệu thực tế từ trạm quan trắc khi chỉ số vượt quá ngưỡng bạn đặt.
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Bật cảnh báo AQI</Text>
                    <Switch
                        value={isEnabled} onValueChange={toggleSwitch}
                        trackColor={{ true: '#2F847C', false: '#767577' }} thumbColor={'#fff'}
                    />
                </View>

                {isEnabled && (
                    <TouchableOpacity style={styles.row} onPress={openEditModal}>
                        <Text style={styles.label}>Ngưỡng cảnh báo AQI</Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.valueText}>lớn hơn {threshold}</Text>
                            <Ionicons name="pencil" size={16} color="#2F847C" style={{ marginLeft: 8 }} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Đặt ngưỡng AQI</Text>
                                <Text style={styles.modalDesc}>Ứng dụng sẽ so sánh dữ liệu thực tế với ngưỡng này.</Text>
                                <TextInput
                                    style={styles.modalInput} value={tempThreshold} onChangeText={setTempThreshold}
                                    keyboardType="numeric" autoFocus={true} maxLength={3}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.btnTextCancel}>Huỷ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnSave} onPress={saveThreshold}>
                                        <Text style={styles.btnTextSave}>Lưu</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    infoBox: { flexDirection: 'row', backgroundColor: '#E0F2F1', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
    infoText: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 13, color: '#00695C', lineHeight: 18 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 16, borderRadius: 12, marginBottom: 12 },
    label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    valueContainer: { flexDirection: 'row', alignItems: 'center' },
    valueText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#2F847C' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25, width: 300, alignItems: 'center', elevation: 5 },
    modalTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, marginBottom: 10, color: '#333' },
    modalDesc: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    modalInput: { borderBottomWidth: 2, borderBottomColor: '#2F847C', width: '60%', textAlign: 'center', fontSize: 32, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 30 },
    modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    btnCancel: { flex: 1, padding: 12, alignItems: 'center', marginRight: 10 },
    btnSave: { flex: 1, backgroundColor: '#2F847C', padding: 12, borderRadius: 10, alignItems: 'center', elevation: 2 },
    btnTextCancel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#666' },
    btnTextSave: { fontFamily: 'Nunito-Bold', fontSize: 16, color: 'white' }
});

export default AQISettingsScreen;