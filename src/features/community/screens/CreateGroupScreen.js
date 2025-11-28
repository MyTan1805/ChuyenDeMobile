import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity,
    Switch, Alert, Modal, FlatList
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import AppButton from '@/components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';

// --- MOCK DATA ĐỊA CHÍNH (Rút gọn demo) ---
// Trong thực tế, bạn nên gọi API hành chính công hoặc dùng thư viện json
const LOCATION_DATA = {
    'TP. Hồ Chí Minh': {
        'Quận 1': ['P. Bến Nghé', 'P. Bến Thành', 'P. Đa Kao', 'P. Tân Định'],
        'Quận 3': ['P. Võ Thị Sáu', 'P. 1', 'P. 2', 'P. 3'],
        'Quận 7': ['P. Tân Phong', 'P. Tân Phú', 'P. Bình Thuận'],
        'TP. Thủ Đức': ['P. Thảo Điền', 'P. An Phú', 'P. Hiệp Phú']
    },
    'Hà Nội': {
        'Q. Hoàn Kiếm': ['P. Hàng Bạc', 'P. Hàng Gai', 'P. Tràng Tiền'],
        'Q. Ba Đình': ['P. Kim Mã', 'P. Giảng Võ', 'P. Liễu Giai'],
        'Q. Cầu Giấy': ['P. Dịch Vọng', 'P. Yên Hòa']
    }
};

const CreateGroupScreen = ({ navigation }) => {
    const { createGroup } = useGroupStore();
    const { user } = useUserStore();

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    // --- STATES CHO LOCATION ---
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');

    // Modal controls
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'city', 'district', 'ward'

    // --- LOGIC XỬ LÝ LOCATION ---
    const openModal = (type) => {
        if (type === 'district' && !city) return Alert.alert("Lưu ý", "Vui lòng chọn Tỉnh/TP trước.");
        if (type === 'ward' && !district) return Alert.alert("Lưu ý", "Vui lòng chọn Quận/Huyện trước.");
        setModalType(type);
        setModalVisible(true);
    };

    const handleSelectLocation = (value) => {
        setModalVisible(false);
        if (modalType === 'city') {
            if (city !== value) { setCity(value); setDistrict(''); setWard(''); }
        } else if (modalType === 'district') {
            if (district !== value) { setDistrict(value); setWard(''); }
        } else if (modalType === 'ward') {
            setWard(value);
        }
    };

    const getListData = () => {
        if (modalType === 'city') return Object.keys(LOCATION_DATA);
        if (modalType === 'district') return city ? Object.keys(LOCATION_DATA[city]) : [];
        if (modalType === 'ward') return (city && district) ? LOCATION_DATA[city][district] : [];
        return [];
    };

    const handleCreate = async () => {
        if (!name.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên nhóm.");
        if (!city || !district || !ward) return Alert.alert("Lỗi", "Vui lòng chọn đầy đủ khu vực hoạt động.");

        const fullLocation = `${ward}, ${district}, ${city}`;

        const groupData = {
            name: name.trim(),
            description: desc.trim(),
            location: fullLocation, // Lưu chuỗi đầy đủ để hiển thị
            city,       // Lưu lẻ để filter sau này
            district,   // Lưu lẻ để filter sau này
            ward,       // Lưu lẻ để filter sau này
            isPrivate,
            image: 'https://images.unsplash.com/photo-1596386461350-326e9130e131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' // Demo ảnh
        };

        const result = createGroup(groupData, user?.uid || 'temp_uid');
        if (result.success) {
            Alert.alert("Thành công", `Nhóm "${name}" tại ${fullLocation} đã được tạo!`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Tạo Nhóm Mới" showBackButton={true} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Banner Placeholder */}
                <View style={styles.imageUpload}>
                    <Ionicons name="camera-outline" size={40} color="#2F847C" />
                    <Text style={styles.uploadText}>Thêm ảnh bìa nhóm</Text>
                </View>

                {/* Tên Nhóm */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tên nhóm <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="VD: Cộng đồng Xanh Quận 1"
                        value={name} onChangeText={setName}
                    />
                </View>

                {/* --- KHU VỰC CHỌN ĐỊA ĐIỂM (FR-8.1.3) --- */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Khu vực hoạt động <Text style={styles.required}>*</Text></Text>

                    {/* Chọn Tỉnh/TP */}
                    <TouchableOpacity style={styles.selectBox} onPress={() => openModal('city')}>
                        <Text style={[styles.selectText, !city && styles.placeholderText]}>
                            {city || "Chọn Tỉnh/Thành phố"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    <View style={styles.row}>
                        {/* Chọn Quận/Huyện */}
                        <TouchableOpacity style={[styles.selectBox, styles.halfBox]} onPress={() => openModal('district')}>
                            <Text style={[styles.selectText, !district && styles.placeholderText]} numberOfLines={1}>
                                {district || "Quận/Huyện"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* Chọn Phường/Xã */}
                        <TouchableOpacity style={[styles.selectBox, styles.halfBox]} onPress={() => openModal('ward')}>
                            <Text style={[styles.selectText, !ward && styles.placeholderText]} numberOfLines={1}>
                                {ward || "Phường/Xã"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hint}>Nhóm sẽ được gợi ý chính xác cho cư dân tại khu vực này.</Text>
                </View>

                {/* Mô tả */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mục tiêu của nhóm là gì?"
                        multiline numberOfLines={3}
                        value={desc} onChangeText={setDesc}
                    />
                </View>

                {/* Riêng tư */}
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

                <AppButton title="Tạo Nhóm" onPress={handleCreate} style={{ marginTop: 10 }} />
            </ScrollView>

            {/* --- MODAL CHỌN ĐỊA ĐIỂM --- */}
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
                        <FlatList
                            data={getListData()}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectLocation(item)}>
                                    <Text style={styles.modalItemText}>{item}</Text>
                                    {((modalType === 'city' && city === item) ||
                                        (modalType === 'district' && district === item) ||
                                        (modalType === 'ward' && ward === item)) &&
                                        <Ionicons name="checkmark" size={20} color="#2F847C" />
                                    }
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    imageUpload: { height: 150, backgroundColor: '#E0F2F1', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#2F847C' },
    uploadText: { marginTop: 10, color: '#00796B', fontFamily: 'Nunito-Bold' },

    formGroup: { marginBottom: 20 },
    label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333', marginBottom: 8 },
    required: { color: 'red' },

    input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' },
    textArea: { height: 80, textAlignVertical: 'top' },

    // Style cho Select Box
    selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, marginBottom: 10 },
    selectText: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' },
    placeholderText: { color: '#999' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfBox: { width: '48%' },

    hint: { fontSize: 12, color: '#757575', marginTop: -5, marginBottom: 5, fontStyle: 'italic' },

    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, padding: 15, backgroundColor: '#FAFAFA', borderRadius: 12 },
    switchLabel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    switchSub: { fontSize: 13, color: '#757575', marginTop: 2 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    modalTitle: { fontSize: 18, fontFamily: 'Nunito-Bold' },
    modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
    modalItemText: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' }
});

export default CreateGroupScreen;