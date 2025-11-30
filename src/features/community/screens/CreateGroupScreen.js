// src/features/community/screens/CreateGroupScreen.js

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity,
    Switch, Alert, Modal, FlatList, Image, ActivityIndicator
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import AppButton from '@/components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';
import { auth } from '@/config/firebaseConfig';

// ✅ 1. Import các hàm lấy địa lý
import { getProvinces, getDistricts, getWards } from '@/utils/vietnamLocations';

const CreateGroupScreen = ({ navigation }) => {
    const { createGroup } = useGroupStore();
    const { uploadMedia } = useUserStore();

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- ✅ 2. STATE CHO LOGIC ĐỊA LÝ MỚI ---
    // Danh sách dữ liệu để hiển thị trong Modal
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Đối tượng được chọn (chứa cả code và name)
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'city', 'district', 'ward'
    const [isLoadingLocation, setIsLoadingLocation] = useState(false); // Loading cho modal

    // --- ✅ 3. LOAD TỈNH/THÀNH KHI MOUNT ---
    useEffect(() => {
        const fetchProvinces = async () => {
            const data = await getProvinces();
            setProvinces(data);
        };
        fetchProvinces();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [16, 9], quality: 0.7,
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    // --- ✅ 4. LOGIC MỞ MODAL ---
    const openModal = async (type) => {
        if (type === 'district' && !selectedProvince) return Alert.alert("Lưu ý", "Vui lòng chọn Tỉnh/TP trước.");
        if (type === 'ward' && !selectedDistrict) return Alert.alert("Lưu ý", "Vui lòng chọn Quận/Huyện trước.");

        setModalType(type);
        setModalVisible(true);

        // Nếu danh sách chưa có (đề phòng), fetch lại
        if (type === 'city' && provinces.length === 0) {
            setIsLoadingLocation(true);
            setProvinces(await getProvinces());
            setIsLoadingLocation(false);
        }
    };

    // --- ✅ 5. LOGIC CHỌN ĐỊA ĐIỂM (CASCADE) ---
    const handleSelectLocation = async (item) => {
        // Item structure: { code: 1, name: "Hà Nội" }

        if (modalType === 'city') {
            if (selectedProvince?.code !== item.code) {
                setSelectedProvince(item);
                setSelectedDistrict(null);
                setSelectedWard(null);
                setDistricts([]);
                setWards([]);

                // Fetch Quận/Huyện ngay sau khi chọn Tỉnh
                setIsLoadingLocation(true);
                const districtData = await getDistricts(item.code);
                setDistricts(districtData);
                setIsLoadingLocation(false);
            }
        } else if (modalType === 'district') {
            if (selectedDistrict?.code !== item.code) {
                setSelectedDistrict(item);
                setSelectedWard(null);
                setWards([]);

                // Fetch Phường/Xã ngay sau khi chọn Quận
                setIsLoadingLocation(true);
                const wardData = await getWards(item.code);
                setWards(wardData);
                setIsLoadingLocation(false);
            }
        } else if (modalType === 'ward') {
            setSelectedWard(item);
        }
        setModalVisible(false);
    };

    // Helper lấy data cho FlatList hiện tại
    const getCurrentListData = () => {
        if (modalType === 'city') return provinces;
        if (modalType === 'district') return districts;
        if (modalType === 'ward') return wards;
        return [];
    };

    const handleCreate = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return Alert.alert("Lỗi", "Bạn cần đăng nhập để tạo nhóm.");

        if (!name.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên nhóm.");
        if (!selectedProvince || !selectedDistrict || !selectedWard) return Alert.alert("Lỗi", "Vui lòng chọn đầy đủ khu vực hoạt động.");

        setLoading(true);

        try {
            let finalImageUrl = 'https://via.placeholder.com/500';
            if (imageUri) {
                const uploadRes = await uploadMedia(imageUri, 'image');
                if (uploadRes.success) finalImageUrl = uploadRes.url;
                else Alert.alert("Cảnh báo", "Không thể tải ảnh lên. Dùng ảnh mặc định.");
            }

            // ✅ Tạo string địa chỉ đầy đủ để lưu Firebase
            const fullLocation = `${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;

            const groupData = {
                name: name.trim(),
                description: desc.trim(),
                location: fullLocation,
                // Lưu chi tiết để sau này lọc
                city: selectedProvince.name,
                district: selectedDistrict.name,
                ward: selectedWard.name,
                isPrivate,
                image: finalImageUrl
            };

            const result = await createGroup(groupData, currentUser.uid);

            if (result.success) {
                Alert.alert("Thành công", `Nhóm "${name}" đã được tạo!`, [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Lỗi", result.error || "Không thể tạo nhóm");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Tạo Nhóm Mới" showBackButton={true} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Image Upload UI (Giữ nguyên) */}
                <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                    {imageUri ? (
                        <>
                            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                            <View style={styles.changeImageOverlay}>
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.changeImageText}>Thay đổi</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={40} color="#2F847C" />
                            <Text style={styles.uploadText}>Thêm ảnh bìa nhóm</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tên nhóm <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="VD: Cộng đồng Xanh Quận 1"
                            value={name} onChangeText={setName}
                            maxLength={50}
                        />
                        <Text style={styles.charCount}>{name.length}/50</Text>
                    </View>

                    {/* --- ✅ UI CHỌN ĐỊA ĐIỂM --- */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Khu vực hoạt động <Text style={styles.required}>*</Text></Text>

                        <TouchableOpacity style={styles.selectBox} onPress={() => openModal('city')}>
                            <Text style={[styles.selectText, !selectedProvince && styles.placeholderText]}>
                                {selectedProvince?.name || "Chọn Tỉnh/Thành phố"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.selectBox, styles.halfBox]} onPress={() => openModal('district')}>
                                <Text style={[styles.selectText, !selectedDistrict && styles.placeholderText]} numberOfLines={1}>
                                    {selectedDistrict?.name || "Quận/Huyện"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.selectBox, styles.halfBox]} onPress={() => openModal('ward')}>
                                <Text style={[styles.selectText, !selectedWard && styles.placeholderText]} numberOfLines={1}>
                                    {selectedWard?.name || "Phường/Xã"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>Nhóm sẽ được gợi ý chính xác cho cư dân tại khu vực này.</Text>
                    </View>

                    {/* ... Các phần Mô tả, Privacy, Button giữ nguyên ... */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Mục tiêu của nhóm là gì?"
                            multiline numberOfLines={3}
                            value={desc} onChangeText={setDesc}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchLabel}>Nhóm Riêng Tư</Text>
                            <Text style={styles.switchSub}>Chỉ thành viên mới xem được bài viết.</Text>
                        </View>
                        <Switch
                            value={isPrivate}
                            onValueChange={setIsPrivate}
                            trackColor={{ true: '#2F847C', false: '#EEE' }}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#2F847C" style={{ marginTop: 10 }} />
                    ) : (
                        <AppButton title="Tạo Nhóm" onPress={handleCreate} style={{ marginTop: 10 }} />
                    )}
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>

            {/* --- ✅ MODAL HIỂN THỊ DANH SÁCH --- */}
            <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Chọn {modalType === 'city' ? 'Tỉnh/TP' : modalType === 'district' ? 'Quận/Huyện' : 'Phường/Xã'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {isLoadingLocation ? (
                            <ActivityIndicator size="large" color="#2F847C" style={{ margin: 20 }} />
                        ) : (
                            <FlatList
                                data={getCurrentListData()}
                                keyExtractor={(item) => item.code.toString()}
                                renderItem={({ item }) => {
                                    // Logic xác định item đang active để tick xanh
                                    let isActive = false;
                                    if (modalType === 'city' && selectedProvince?.code === item.code) isActive = true;
                                    if (modalType === 'district' && selectedDistrict?.code === item.code) isActive = true;
                                    if (modalType === 'ward' && selectedWard?.code === item.code) isActive = true;

                                    return (
                                        <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectLocation(item)}>
                                            <Text style={[styles.modalItemText, isActive && { color: '#2F847C', fontFamily: 'Nunito-Bold' }]}>{item.name}</Text>
                                            {isActive && <Ionicons name="checkmark" size={20} color="#2F847C" />}
                                        </TouchableOpacity>
                                    )
                                }}
                                ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: '#999' }}>Không có dữ liệu</Text>}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Styles (Giữ nguyên hoặc thêm mới nếu thiếu)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    imageUpload: {
        height: 180, backgroundColor: '#E0F2F1', borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
        borderStyle: 'dashed', borderWidth: 1, borderColor: '#2F847C', overflow: 'hidden'
    },
    previewImage: { width: '100%', height: '100%' },
    changeImageOverlay: {
        position: 'absolute', bottom: 10, right: 10, flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center'
    },
    changeImageText: { color: '#fff', marginLeft: 5, fontFamily: 'Nunito-Bold', fontSize: 12 },
    uploadText: { marginTop: 10, color: '#00796B', fontFamily: 'Nunito-Bold' },
    form: { padding: 0 },
    formGroup: { marginBottom: 20 },
    label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333', marginBottom: 8 },
    required: { color: 'red' },
    input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' },
    textArea: { height: 80, textAlignVertical: 'top' },
    charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 5, fontFamily: 'Nunito-Regular' },

    // Select Box Styles
    selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, marginBottom: 10 },
    selectText: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' },
    placeholderText: { color: '#999' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfBox: { width: '48%' },
    hint: { fontSize: 12, color: '#757575', marginTop: -5, marginBottom: 5, fontStyle: 'italic', fontFamily: 'Nunito-Regular' },

    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, padding: 15, backgroundColor: '#FAFAFA', borderRadius: 12 },
    switchLabel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    switchSub: { fontSize: 13, color: '#757575', marginTop: 2, fontFamily: 'Nunito-Regular' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    modalTitle: { fontSize: 18, fontFamily: 'Nunito-Bold' },
    modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
    modalItemText: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' }
});

export default CreateGroupScreen;