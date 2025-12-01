import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // Import Icon

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { userProfile, updateUserProfile, uploadAvatar } = useUserStore();

    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [phone, setPhone] = useState('');

    const [imageUri, setImageUri] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.displayName || '');
            setArea(userProfile.location || '');
            setPhone(userProfile.phoneNumber || '');
            if (userProfile.photoURL) {
                setImageUri(userProfile.photoURL);
            }
        }
    }, [userProfile]);

    const pickImage = async () => {
        // 1. Xin quyền truy cập thư viện
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục.');
            return;
        }

        // 2. Mở thư viện ảnh với cấu hình mới
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (uploading) return;
        setUploading(true);

        try {
            // 1. Logic Upload ảnh
            let newPhotoURL = userProfile?.photoURL; // Mặc định là ảnh cũ

            // Kiểm tra nếu là ảnh mới từ thư viện (có prefix file://)
            if (imageUri && imageUri !== userProfile?.photoURL && imageUri.startsWith('file://')) {
                const result = await uploadAvatar(imageUri);
                if (result.success) {
                    newPhotoURL = result.url; // Lấy URL mới từ Cloudinary/Firebase Storage
                } else {
                    Alert.alert("Lỗi", "Không thể tải ảnh lên: " + JSON.stringify(result.error));
                    setUploading(false);
                    return; // Dừng nếu upload lỗi
                }
            }

            // 2. Cập nhật thông tin (THÊM photoURL VÀO ĐÂY)
            const updateData = {
                displayName: name,
                location: area,
                phoneNumber: phone,
                photoURL: newPhotoURL // <--- QUAN TRỌNG: Cập nhật link ảnh mới
            };

            const result = await updateUserProfile(updateData);

            if (result.success) {
                Alert.alert("Thành công", "Đã cập nhật hồ sơ!");
                navigation.goBack();
            } else {
                Alert.alert("Lỗi", "Cập nhật thông tin thất bại.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
        } finally {
            setUploading(false);
        }
    };

    const renderInput = (label, value, setter, editable = true) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput
                style={[styles.input, !editable && styles.disabledInput]}
                value={value}
                onChangeText={setter}
                editable={editable}
                placeholder={`Nhập ${label.toLowerCase()}...`}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader title="Chỉnh sửa hồ sơ" showBackButton={true} />
            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder} />
                        )}

                        {/* Thay Icon máy ảnh đẹp hơn */}
                        <View style={styles.cameraIconBadge}>
                            <Ionicons name="camera" size={18} color="#333" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage}>
                        <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
                    </TouchableOpacity>
                </View>

                {renderInput("Tên hiển thị", name, setName)}
                {renderInput("Khu vực sinh sống", area, setArea)}
                {renderInput("Số điện thoại", phone, setPhone)}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (Không thể sửa):</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={useUserStore.getState().user?.email} editable={false} />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Huỷ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading}>
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={[styles.buttonText, { color: 'white' }]}>Lưu thay đổi</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20 },

    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative' },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0' },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },

    // Style cho icon máy ảnh
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    changeAvatarText: { color: '#2F847C', fontFamily: 'Nunito-Bold', marginTop: 12, fontSize: 16 },

    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Nunito-Regular', marginBottom: 5, fontSize: 16 },
    input: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, fontFamily: 'Nunito-Regular', fontSize: 16 },
    disabledInput: { color: '#999', backgroundColor: '#e0e0e0' },

    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelButton: { flex: 1, backgroundColor: '#ddd', padding: 15, borderRadius: 25, alignItems: 'center', marginRight: 10 },
    saveButton: { flex: 1, backgroundColor: '#2F847C', padding: 15, borderRadius: 25, alignItems: 'center', marginLeft: 10 },
    buttonText: { fontFamily: 'Nunito-Bold', fontSize: 16 }
});

export default EditProfileScreen;