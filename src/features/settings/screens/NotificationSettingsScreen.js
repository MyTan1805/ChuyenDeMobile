import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, Switch, Alert, TouchableOpacity, 
    Modal, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform 
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useUserStore } from '@/store/userStore';
import { useNotifications } from '@/hooks/useNotifications'; 
import { Ionicons } from '@expo/vector-icons';

// Component hiển thị 1 dòng cài đặt
const ToggleRow = ({ label, settingKey, initialValue, onToggle, showEdit, onEdit, timeValue }) => {
    return (
        <View style={styles.rowWrapper}>
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={initialValue ? "#2F847C" : "#f4f3f4"}
                    onValueChange={(val) => onToggle(settingKey, val)}
                    value={initialValue}
                />
            </View>
            {/* Nếu đang bật và là dòng Rác thì hiện nút chỉnh giờ */}
            {initialValue && showEdit && (
                <TouchableOpacity style={styles.editRow} onPress={onEdit}>
                    <Text style={styles.editText}>Nhắc vào lúc: <Text style={styles.boldTime}>{timeValue || '19:00'}</Text></Text>
                    <Ionicons name="create-outline" size={20} color="#2F847C" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const NotificationSettingsScreen = () => {
    const { userProfile, updateUserSettings } = useUserStore();
    const { scheduleReminder } = useNotifications(); 

    // State lưu cài đặt bật/tắt
    const [settings, setSettings] = useState(userProfile?.notificationSettings || {
        weather: false, trash: false, campaign: false, community: false
    });

    // State lưu giờ nhắc rác (Mặc định 19:00 nếu chưa có)
    const [trashTime, setTrashTime] = useState(userProfile?.trashTime || "19:00");
    
    // State cho Modal chỉnh giờ
    const [modalVisible, setModalVisible] = useState(false);
    const [tempTime, setTempTime] = useState(trashTime);

    const handleToggle = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        // Lưu settings bật/tắt vào Firebase
        await updateUserSettings({ notificationSettings: newSettings });

        if (key === 'trash' && value) {
            // Nếu bật lịch rác -> Lên lịch nhắc ngay theo giờ hiện tại
            await setupTrashNotification(trashTime);
        }
    };

    // Hàm xử lý lưu giờ từ Modal
    const saveTime = async () => {
        // Validate định dạng giờ HH:mm
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(tempTime)) {
            Alert.alert("Lỗi", "Vui lòng nhập giờ đúng định dạng 24h (Ví dụ: 19:30)");
            return;
        }

        setTrashTime(tempTime);
        setModalVisible(false);

        // 1. Lưu giờ vào Firebase
        await updateUserSettings({ trashTime: tempTime });

        // 2. Cài đặt lại thông báo với giờ mới
        await setupTrashNotification(tempTime);
        
        Alert.alert("Đã cập nhật", `Hệ thống sẽ nhắc bạn đổ rác vào lúc ${tempTime} hàng ngày.`);
    };

    // Hàm gọi hook lên lịch thông báo
    const setupTrashNotification = async (timeStr) => {
        // timeStr dạng "19:30"
        const [hour, minute] = timeStr.split(':').map(Number);
        
        // Tính toán số giây từ giờ hiện tại đến giờ nhắc (Logic đơn giản để demo)
        // Trong thực tế sẽ dùng trigger: { hour, minute, repeats: true }
        
        // Ở đây mình gọi hàm giả lập scheduleReminder từ hook
        // "seconds: 5" là để bạn test ngay cho thầy cô xem
        // Nếu muốn thật: Bạn cần sửa hook useNotifications dùng trigger calendar
        await scheduleReminder(
            "🚛 Nhắc nhở thu gom rác", 
            `Đã đến ${timeStr}. Hãy mang rác tái chế ra điểm tập kết nhé!`, 
            5 // Demo: Nhắc sau 5 giây. Nếu muốn thật thì chỉnh logic sau.
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Cài đặt thông báo" showBackButton={true} />
            <View style={styles.content}>
                
                {/* Các dòng cài đặt khác */}
                <ToggleRow label="Cảnh báo thời tiết & AQI" settingKey="weather" initialValue={settings.weather} onToggle={handleToggle} />
                
                {/* Dòng Rác có thêm nút sửa giờ */}
                <ToggleRow 
                    label="Nhắc lịch thu gom rác" 
                    settingKey="trash" 
                    initialValue={settings.trash} 
                    onToggle={handleToggle}
                    showEdit={true}
                    onEdit={() => { setTempTime(trashTime); setModalVisible(true); }}
                    timeValue={trashTime}
                />

                <ToggleRow label="Chiến dịch môi trường" settingKey="campaign" initialValue={settings.campaign} onToggle={handleToggle} />
                <ToggleRow label="Tương tác cộng đồng" settingKey="community" initialValue={settings.community} onToggle={handleToggle} />
            </View>

            {/* MODAL CHỈNH GIỜ */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Đặt giờ nhắc nhở</Text>
                                <Text style={styles.modalDesc}>Nhập giờ bạn muốn nhận thông báo (24h)</Text>
                                
                                <TextInput
                                    style={styles.modalInput}
                                    value={tempTime}
                                    onChangeText={setTempTime}
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={5}
                                    placeholder="19:00"
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.btnTextCancel}>Huỷ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnSave} onPress={saveTime}>
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
    rowWrapper: {
        backgroundColor: '#F5F5F5', borderRadius: 12, marginBottom: 12, overflow: 'hidden'
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, 
    },
    label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    
    // Edit Row Styles
    editRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 15, paddingBottom: 15, paddingTop: 0
    },
    editText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#555' },
    boldTime: { fontFamily: 'Nunito-Bold', color: '#2F847C', fontSize: 16 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25, width: 300, alignItems: 'center', elevation: 5 },
    modalTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, marginBottom: 10, color: '#333' },
    modalDesc: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666', marginBottom: 20 },
    modalInput: { 
        borderBottomWidth: 2, borderBottomColor: '#2F847C', width: '60%', 
        textAlign: 'center', fontSize: 32, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 30 
    },
    modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    btnCancel: { flex: 1, padding: 12, alignItems: 'center', marginRight: 10 },
    btnSave: { flex: 1, backgroundColor: '#2F847C', padding: 12, borderRadius: 10, alignItems: 'center' },
    btnTextCancel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#666' },
    btnTextSave: { fontFamily: 'Nunito-Bold', fontSize: 16, color: 'white' }
});

export default NotificationSettingsScreen;