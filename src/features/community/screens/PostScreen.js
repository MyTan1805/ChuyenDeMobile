import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
    ScrollView, KeyboardAvoidingView, Platform, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import EmojiPicker from 'rn-emoji-keyboard';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
import { useGroupStore } from '@/store/groupStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { auth } from '@/config/firebaseConfig';
import CustomHeader from '@/components/CustomHeader';
import { serverTimestamp } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; // ✅ Import quan trọng

const PostScreen = ({ navigation, route }) => {
    const { userProfile, uploadMedia } = useUserStore();
    const { addNewPost, updatePost } = useCommunityStore();
    const { addPostToGroup } = useGroupStore();
    const insets = useSafeAreaInsets();

    const [content, setContent] = useState('');
    const [mediaItems, setMediaItems] = useState([]);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [privacy, setPrivacy] = useState('public');
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);

    // Biến tạm để lưu thông tin edit (nếu có)
    const [editingPostId, setEditingPostId] = useState(null);
    const [groupData, setGroupData] = useState({ id: null, name: null });

    // ✅ LOGIC RESET FORM QUAN TRỌNG
    useFocusEffect(
        useCallback(() => {
            const params = route.params || {};
            // Lấy groupIsPrivate
            const { isEdit, existingPost, groupId, groupName, groupIsPrivate } = params;

            if (isEdit && existingPost) {
                setEditingPostId(existingPost.id);
                setContent(existingPost.content || '');
                setMediaItems(existingPost.images || []);
                setPrivacy(existingPost.privacy || 'public'); // Giữ nguyên privacy cũ
                setLocation(existingPost.location || null);
                setGroupData({ id: existingPost.groupId, name: existingPost.groupName });
            } else {
                setEditingPostId(null);
                setContent('');
                setMediaItems([]);
                setLocation(null);

                // Nếu đăng từ trong nhóm ra thì set sẵn nhóm
                if (groupId) {
                    setGroupData({ id: groupId, name: groupName });
                    // ✅ NẾU NHÓM KÍN -> BÀI VIẾT LÀ PRIVATE, NGƯỢC LẠI LÀ PUBLIC
                    setPrivacy(groupIsPrivate ? 'private' : 'public');
                } else {
                    setGroupData({ id: null, name: null });
                    setPrivacy('public');
                }
            }

            // Cleanup function (Optional)
            return () => { };
        }, [route.params])
    );

    const pickMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            selectionLimit: 4,
            quality: 0.7, // Giảm chất lượng chút để upload nhanh hơn
        });

        if (!result.canceled) {
            const newItems = result.assets.map(asset => ({
                uri: asset.uri,
                type: asset.type // 'image' hoặc 'video'
            }));
            setMediaItems([...mediaItems, ...newItems].slice(0, 4));
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.7,
            });
            if (!result.canceled) {
                setMediaItems([...mediaItems, { uri: result.assets[0].uri, type: 'image' }].slice(0, 4));
            }
        }
    };

    const handleAddLocation = () => {
        Alert.alert("Vị trí", "Đã thêm vị trí: TP. Hồ Chí Minh");
        setLocation("TP. Hồ Chí Minh");
    };

    const removeMedia = (index) => {
        setMediaItems(mediaItems.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return Alert.alert("Lỗi", "Bạn cần đăng nhập.");

        if (!content.trim() && mediaItems.length === 0) {
            return Alert.alert("Lỗi", "Vui lòng nhập nội dung.");
        }

        setLoading(true);

        try {
            const finalMediaList = [];

            // 1. Upload File
            for (const item of mediaItems) {
                // Nếu ảnh đã có link (ảnh cũ), giữ nguyên
                if (item.uri.startsWith('http')) {
                    finalMediaList.push(item);
                } else {
                    // Upload ảnh mới
                    const uploadRes = await uploadMedia(item.uri, item.type);
                    if (uploadRes.success) {
                        finalMediaList.push({ uri: uploadRes.url, type: uploadRes.type });
                    } else {
                        throw new Error("Lỗi tải file: " + uploadRes.error);
                    }
                }
            }

            // 2. Submit
            if (editingPostId) {
                // UPDATE
                const updateData = {
                    content: content.trim(),
                    images: finalMediaList,
                    privacy: privacy,
                    location: location
                };
                const result = await updatePost(editingPostId, updateData);
                if (result.success) navigation.goBack();
                else Alert.alert("Lỗi", result.error);

            } else {
                // CREATE NEW
                const newPost = {
                    userName: userProfile?.displayName || 'Người dùng',
                    userAvatar: userProfile?.photoURL || null,
                    content: content.trim(),
                    images: finalMediaList,
                    privacy: privacy,
                    groupName: groupData.name || null,
                    groupId: groupData.id || null,
                    location: location,
                    createdAt: serverTimestamp()
                };

                const result = await addNewPost(newPost);

                if (result.success) {
                    if (groupData.id && result.postId) {
                        await addPostToGroup(groupData.id, { id: result.postId });
                    }
                    navigation.goBack();
                } else {
                    Alert.alert("Lỗi", result.error);
                }
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", error.message || "Không thể đăng bài.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmojiSelect = (emojiObject) => {
        setContent((prev) => prev + emojiObject.emoji);
    };

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <CustomHeader
                title={editingPostId ? "Chỉnh sửa bài viết" : (groupData.name ? `Đăng vào ${groupData.name}` : "Tạo bài viết")}
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                style={{ zIndex: 1 }}
            />

            <View style={[styles.headerPostButtonContainer, { top: insets.top + 10 }]}>
                <TouchableOpacity
                    style={[styles.postButton, loading && { opacity: 0.5 }]}
                    disabled={loading}
                    onPress={handlePost}
                >
                    {loading ? <ActivityIndicator color="#fff" size="small" /> :
                        <Text style={styles.postButtonText}>{editingPostId ? "Lưu" : "Đăng"}</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* User Info Section */}
                    <View style={styles.userSection}>
                        <Image source={{ uri: userProfile?.photoURL || 'https://i.pravatar.cc/150?img=3' }} style={styles.avatar} />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{userProfile?.displayName || 'Người dùng'}</Text>
                            <View style={styles.badgesRow}>
                                <View style={styles.privacyBadge}>
                                    <Ionicons name={groupData.id ? "people" : "earth"} size={12} color="#666" />
                                    <Text style={styles.privacyText}> {groupData.id ? "Thành viên" : "Công khai"}</Text>
                                </View>
                                {location && (
                                    <View style={styles.locationBadge}>
                                        <Ionicons name="location" size={12} color="#E91E63" />
                                        <Text style={styles.locationText}> {location}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <TextInput
                        style={styles.textInput}
                        placeholder="Bạn đang nghĩ gì?"
                        placeholderTextColor="#999"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />

                    {/* Media Grid */}
                    {mediaItems.length > 0 && (
                        <View style={styles.imagesGrid}>
                            {mediaItems.map((item, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    {item.type === 'video' ? (
                                        <Video source={{ uri: item.uri }} style={styles.previewImage} resizeMode={ResizeMode.COVER} isMuted={true} />
                                    ) : (
                                        <Image source={{ uri: item.uri }} style={styles.previewImage} />
                                    )}
                                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeMedia(index)}>
                                        <Ionicons name="close-circle" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Toolbar */}
                <View style={styles.toolbarContainer}>
                    <Text style={styles.toolbarTitle}>Thêm vào bài viết</Text>
                    <View style={styles.gridToolbar}>
                        <TouchableOpacity style={styles.gridItem} onPress={pickMedia}>
                            <Ionicons name="images" size={24} color="#4CAF50" />
                            <Text style={styles.gridLabel}>Ảnh/Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem} onPress={takePhoto}>
                            <Ionicons name="camera" size={24} color="#2196F3" />
                            <Text style={styles.gridLabel}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem} onPress={() => setIsEmojiOpen(true)}>
                            <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#FFC107" />
                            <Text style={styles.gridLabel}>Cảm xúc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridItem} onPress={handleAddLocation}>
                            <Ionicons name="location" size={24} color="#E91E63" />
                            <Text style={styles.gridLabel}>Check-in</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <EmojiPicker onEmojiSelected={handleEmojiSelect} open={isEmojiOpen} onClose={() => setIsEmojiOpen(false)} />
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    headerPostButtonContainer: { position: 'absolute', right: 16, zIndex: 20 },
    postButton: { backgroundColor: '#2F847C', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    postButtonText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 15 },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    userSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#eee' },
    userInfo: { flex: 1 },
    userName: { fontFamily: 'Nunito-Bold', fontSize: 17, color: '#333' },
    badgesRow: { flexDirection: 'row', marginTop: 4, gap: 8 },
    privacyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    privacyText: { fontSize: 12, color: '#666', fontFamily: 'Nunito-Regular' },
    locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCE4EC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    locationText: { fontSize: 12, color: '#C2185B', fontFamily: 'Nunito-Bold' },
    textInput: { fontSize: 18, fontFamily: 'Nunito-Regular', color: '#333', minHeight: 100, marginBottom: 20 },
    imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    imageWrapper: { width: '48%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
    previewImage: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },
    toolbarContainer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', padding: 16, backgroundColor: '#fff' },
    toolbarTitle: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#333', marginBottom: 12 },
    gridToolbar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    gridItem: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', paddingVertical: 12, borderRadius: 12, justifyContent: 'center', gap: 8 },
    gridLabel: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#333' }
});

export default PostScreen;