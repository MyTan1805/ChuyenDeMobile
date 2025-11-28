// src/features/reports/screens/CreateReportScreen.js

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Image, Alert, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/store/userStore';
import * as ImagePicker from 'expo-image-picker';

const VIOLATION_TYPES = [
    'Rác thải bừa bãi',
    'Khói bụi công nghiệp',
    'Ô nhiễm nguồn nước',
    'Chặt phá cây xanh',
    'Tiếng ồn quá mức',
    'Khác'
];

const SEVERITY_LEVELS = [
    { id: 'low', label: 'Thấp', color: '#FFEB3B', icon: 'alert-circle-outline' },
    { id: 'medium', label: 'Vừa', color: '#FF9800', icon: 'alert-circle' },
    { id: 'high', label: 'Cao', color: '#F44336', icon: 'flame' }
];

const CreateReportScreen = () => {
    const navigation = useNavigation();
    const { addReportToHistory, addPointsToUser } = useUserStore();

    const [type, setType] = useState(VIOLATION_TYPES[0]);
    const [desc, setDesc] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [severity, setSeverity] = useState('low');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 0.5,
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true, aspect: [4, 3], quality: 0.5,
            });
            if (!result.canceled) setImageUri(result.assets[0].uri);
        } else {
            Alert.alert("Cần quyền", "Vui lòng cấp quyền camera.");
        }
    };

    const handleSubmit = async () => {
        if (!desc.trim()) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả chi tiết.");
            return;
        }
        setLoading(true);

        const reportData = {
            title: type,
            type: type,
            description: desc,
            images: imageUri ? [imageUri] : [],
            location: "Vị trí hiện tại (GPS)",
            severity: severity
        };

        const result = await addReportToHistory(reportData);

        if (result.success) {
            await addPointsToUser(50); // Cộng 50 điểm
            Alert.alert("Thành công", "Báo cáo đã được gửi và cộng 50 điểm!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Lỗi", "Không thể gửi báo cáo.");
        }
        setLoading(false);
    };

    const renderDropdown = () => (
        <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                <View style={styles.dropdownBox}>
                    {VIOLATION_TYPES.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.dropdownItem}
                            onPress={() => { setType(item); setModalVisible(false); }}>
                            <Text style={[styles.dropdownText, item === type && styles.dropdownTextActive]}>{item}</Text>
                            {item === type && <Ionicons name="checkmark" size={20} color="#2F847C" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.greenHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo báo cáo</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* 1. Loại vi phạm */}
                <View style={styles.card}>
                    <Text style={styles.label}>Loại vi phạm</Text>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
                        <Text style={styles.dropdownValue}>{type}</Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* 2. Mô tả */}
                <View style={styles.card}>
                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                        style={styles.textArea} placeholder="Mô tả chi tiết..." placeholderTextColor="#999"
                        multiline numberOfLines={4} value={desc} onChangeText={setDesc}
                    />
                    <Text style={styles.charCount}>{desc.length}/500 ký tự</Text>
                </View>

                {/* 3. Bằng chứng */}
                <View style={styles.card}>
                    <Text style={styles.label}>Bằng chứng (Ảnh/Video)</Text>
                    {imageUri ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                                <Ionicons name="close-circle" size={24} color="#F44336" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <View style={styles.cameraCircle}><Ionicons name="camera" size={30} color="white" /></View>
                            <Text style={styles.uploadText}>Thêm ảnh hoặc video</Text>
                        </View>
                    )}
                    <View style={styles.mediaButtonsRow}>
                        <TouchableOpacity style={styles.mediaBtn} onPress={takePhoto}>
                            <Ionicons name="camera" size={20} color="#2F847C" />
                            <Text style={styles.mediaBtnText}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
                            <Ionicons name="images" size={20} color="#2F847C" />
                            <Text style={styles.mediaBtnText}>Thư viện</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 4. Vị trí */}
                <View style={styles.card}>
                    <Text style={styles.label}>Vị trí</Text>
                    <View style={styles.locationBox}>
                        <View style={styles.locationIconBg}><Ionicons name="location" size={20} color="#2F847C" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.locationTitle}>Vị trí hiện tại</Text>
                            <Text style={styles.locationSub}>Quận 1, TP. Hồ Chí Minh</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.mapBtn}>
                        <Ionicons name="map" size={18} color="#333" />
                        <Text style={styles.mapBtnText}>Chọn từ Bản đồ</Text>
                    </TouchableOpacity>
                </View>

                {/* 5. Mức độ nghiêm trọng */}
                <View style={styles.card}>
                    <Text style={styles.label}>Mức độ nghiêm trọng</Text>
                    <View style={styles.severityRow}>
                        {SEVERITY_LEVELS.map((lvl) => {
                            const isSelected = severity === lvl.id;
                            return (
                                <TouchableOpacity key={lvl.id} style={[styles.severityBtn, isSelected && { borderColor: lvl.color, backgroundColor: lvl.color + '20' }]} onPress={() => setSeverity(lvl.id)}>
                                    <Ionicons name={lvl.icon} size={24} color={isSelected ? lvl.color : '#999'} />
                                    <Text style={[styles.severityText, isSelected && { color: lvl.color, fontFamily: 'Nunito-Bold' }]}>{lvl.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Gửi báo cáo</Text>}
                </TouchableOpacity>
                <View style={styles.rewardHint}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rewardText}> Nhận 50 điểm khi gửi báo cáo thành công</Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
            {renderDropdown()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    greenHeader: { backgroundColor: '#2E7D32', height: 100, paddingTop: 40, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 20, fontFamily: 'Nunito-Bold', color: 'white' },
    content: { padding: 16 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333', marginBottom: 10 },
    dropdown: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dropdownValue: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' },
    textArea: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 16, fontFamily: 'Nunito-Regular' },
    charCount: { textAlign: 'right', fontSize: 12, color: '#999', marginTop: 5 },
    uploadPlaceholder: { borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 8, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    cameraCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#81C784', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    uploadText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    previewContainer: { height: 200, marginBottom: 15, borderRadius: 8, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    removeImageBtn: { position: 'absolute', top: 5, right: 5 },
    mediaButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8 },
    mediaBtnText: { marginLeft: 8, color: '#2E7D32', fontFamily: 'Nunito-Bold' },
    locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8, marginBottom: 10 },
    locationIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    locationTitle: { fontFamily: 'Nunito-Bold', fontSize: 14 },
    locationSub: { fontSize: 12, color: '#666' },
    mapBtn: { backgroundColor: '#EEE', padding: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    mapBtnText: { marginLeft: 8, fontFamily: 'Nunito-Bold', color: '#333' },
    severityRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    severityBtn: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FAFAFA' },
    severityText: { marginTop: 5, fontSize: 14, color: '#666', fontFamily: 'Nunito-Regular' },
    submitBtn: { backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    submitBtnText: { color: 'white', fontFamily: 'Nunito-Bold', fontSize: 18 },
    rewardHint: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, alignItems: 'center' },
    rewardText: { color: '#666', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    dropdownBox: { width: '80%', backgroundColor: 'white', borderRadius: 12, padding: 10 },
    dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between' },
    dropdownText: { fontSize: 16, fontFamily: 'Nunito-Regular' },
    dropdownTextActive: { fontFamily: 'Nunito-Bold', color: '#2F847C' }
});

export default CreateReportScreen;