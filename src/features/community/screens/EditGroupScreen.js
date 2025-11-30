import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Image, Alert, Switch, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import CustomHeader from '@/components/CustomHeader';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';

const EditGroupScreen = ({ route }) => {
    const navigation = useNavigation();
    const { groupId } = route.params;

    const { getGroupById, updateGroup, deleteGroup } = useGroupStore();
    const { user } = useUserStore();
    const group = getGroupById(groupId);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (group) {
            setName(group.name);
            setDescription(group.description || '');
            setLocation(group.location);
            setIsPrivate(group.isPrivate || false);
            setImageUri(group.image);
        }
    }, [group]);

    // Kiểm tra quyền admin
    if (!group || group.adminId !== user?.uid) {
        return (
            <View style={styles.errorContainer}>
                <CustomHeader title="Chỉnh sửa nhóm" showBackButton={true} />
                <View style={styles.errorContent}>
                    <Ionicons name="lock-closed-outline" size={60} color="#ccc" />
                    <Text style={styles.errorText}>Bạn không có quyền chỉnh sửa nhóm này</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !location.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên nhóm và khu vực.");
            return;
        }

        setLoading(true);

        const updateData = {
            name: name.trim(),
            description: description.trim(),
            location: location.trim(),
            isPrivate,
            image: imageUri
        };

        const result = await updateGroup(groupId, updateData);
        setLoading(false);

        if (result.success) {
            Alert.alert("Thành công", "Đã cập nhật thông tin nhóm!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Lỗi", "Không thể cập nhật nhóm. Vui lòng thử lại.");
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Xóa nhóm",
            `Bạn có chắc chắn muốn xóa nhóm "${group.name}"? Hành động này không thể hoàn tác.`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        const result = await deleteGroup(groupId, user.uid);
                        setLoading(false);

                        if (result.success) {
                            Alert.alert("Đã xóa", "Nhóm đã được xóa thành công.", [
                                {
                                    text: "OK",
                                    onPress: () => navigation.navigate('MainTabs', { screen: 'Cộng đồng' })
                                }
                            ]);
                        } else {
                            Alert.alert("Lỗi", result.error || "Không thể xóa nhóm.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader
                title="Chỉnh sửa nhóm"
                showBackButton={true}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Cover Image */}
                <TouchableOpacity
                    style={styles.coverContainer}
                    onPress={pickImage}
                    activeOpacity={0.8}
                >
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.coverImage}
                        />
                    ) : (
                        <View style={styles.coverPlaceholder}>
                            <Ionicons name="images-outline" size={40} color="#999" />
                            <Text style={styles.coverPlaceholderText}>
                                Chọn ảnh bìa
                            </Text>
                        </View>
                    )}

                    <View style={styles.editIconBadge}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.form}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Tên nhóm <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="VD: Cộng đồng Xanh Quận 1"
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                        />
                        <Text style={styles.charCount}>{name.length}/50</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Khu vực hoạt động <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="VD: Quận 3, TP.HCM"
                            value={location}
                            onChangeText={setLocation}
                            maxLength={50}
                        />
                        <Text style={styles.hint}>
                            Nhóm sẽ được gợi ý cho người dùng ở khu vực này
                        </Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Mục tiêu và hoạt động của nhóm..."
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            maxLength={200}
                        />
                        <Text style={styles.charCount}>{description.length}/200</Text>
                    </View>

                    {/* Privacy Setting */}
                    <View style={styles.switchContainer}>
                        <View style={styles.switchLeft}>
                            <Ionicons
                                name={isPrivate ? "lock-closed" : "earth"}
                                size={20}
                                color="#333"
                                style={{ marginRight: 10 }}
                            />
                            <View>
                                <Text style={styles.switchLabel}>Nhóm riêng tư</Text>
                                <Text style={styles.switchDesc}>
                                    Chỉ thành viên mới xem được bài viết
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isPrivate}
                            onValueChange={setIsPrivate}
                            trackColor={{ true: '#2F847C', false: '#ccc' }}
                            thumbColor="#fff"
                        />
                    </View>

                    {/* Group Stats */}
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Thống kê nhóm</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="people" size={24} color="#2196F3" />
                                <Text style={styles.statValue}>{group.members}</Text>
                                <Text style={styles.statLabel}>Thành viên</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="document-text" size={24} color="#4CAF50" />
                                <Text style={styles.statValue}>
                                    {group.posts?.length || 0}
                                </Text>
                                <Text style={styles.statLabel}>Bài viết</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="calendar" size={24} color="#FF9800" />
                                <Text style={styles.statValue}>
                                    {new Date(group.createdAt).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </Text>
                                <Text style={styles.statLabel}>Ngày tạo</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Ionicons name="trash" size={20} color="#FF5252" />
                        <Text style={styles.deleteButtonText}>Xóa nhóm</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC'
    },
    content: {
        paddingBottom: 20
    },

    // Cover Image
    coverContainer: {
        width: '100%',
        height: 200,
        position: 'relative'
    },
    coverImage: {
        width: '100%',
        height: '100%'
    },
    coverPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    coverPlaceholderText: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
        fontFamily: 'Nunito-Regular'
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(47, 132, 124, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },

    // Form
    form: {
        padding: 20
    },
    formGroup: {
        marginBottom: 20
    },
    label: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 8
    },
    required: {
        color: '#FF5252'
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#333'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
        fontFamily: 'Nunito-Regular'
    },
    hint: {
        fontSize: 12,
        color: '#757575',
        marginTop: 5,
        fontStyle: 'italic',
        fontFamily: 'Nunito-Regular'
    },

    // Switch
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    switchLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    switchLabel: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#333'
    },
    switchDesc: {
        fontSize: 13,
        color: '#757575',
        marginTop: 2,
        fontFamily: 'Nunito-Regular'
    },

    // Stats Card
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    statsTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 15
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    statItem: {
        alignItems: 'center'
    },
    statValue: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginTop: 8,
        marginBottom: 4
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        fontFamily: 'Nunito-Regular'
    },

    // Action Buttons
    actionsContainer: {
        paddingHorizontal: 20,
        gap: 12
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#2F847C',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
        shadowColor: '#2F847C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-Bold'
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#FF5252',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    deleteButtonText: {
        color: '#FF5252',
        fontSize: 16,
        fontFamily: 'Nunito-Bold'
    },

    // Error State
    errorContainer: {
        flex: 1,
        backgroundColor: '#F7F9FC'
    },
    errorContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#666',
        textAlign: 'center'
    },
    backButton: {
        marginTop: 24,
        backgroundColor: '#2F847C',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-Bold'
    }
});

export default EditGroupScreen;