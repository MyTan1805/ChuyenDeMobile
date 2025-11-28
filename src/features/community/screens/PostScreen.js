// src/features/community/screens/PostScreen.js

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
    ScrollView, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import EmojiPicker from 'rn-emoji-keyboard';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
// 1. THÊM IMPORT useGroupStore
import { useGroupStore } from '@/store/groupStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const PostScreen = ({ navigation, route }) => {
    const { userProfile } = useUserStore();
    const { addNewPost } = useCommunityStore();

    // 2. LẤY HÀM addPostToGroup TỪ STORE
    const { addPostToGroup } = useGroupStore();

    // Lấy tên nhóm và ID nhóm từ params (nếu đăng từ trong nhóm)
    const { groupName, groupId } = route.params || {};

    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [privacy, setPrivacy] = useState('public');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            resetForm();
        });
        return unsubscribe;
    }, [navigation]);

    const resetForm = () => {
        setContent('');
        setImages([]);
        setPrivacy('public');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 4,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages].slice(0, 4));
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true, aspect: [4, 3], quality: 0.8,
            });
            if (!result.canceled) {
                setImages([...images, result.assets[0].uri].slice(0, 4));
            }
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handlePost = () => {
        if (!content.trim() && images.length === 0) return;

        const newPost = {
            id: Date.now().toString(),
            userId: userProfile?.uid || 'uid_temp',
            userName: userProfile?.displayName || 'Người dùng',
            userAvatar: userProfile?.photoURL || 'https://i.pravatar.cc/150?img=3',
            time: 'Vừa xong',
            content: content,
            images: images,
            likes: 0,
            isLiked: false,
            comments: [],
            privacy: privacy,
            groupName: groupName || null,
            groupId: groupId || null,
        };

        // 1. Luôn thêm vào Community Store (để hiện ở trang chủ/khám phá)
        addNewPost(newPost);

        // 3. NẾU CÓ GROUP ID, THÊM VÀO GROUP STORE (để hiện trong chi tiết nhóm)
        if (groupId) {
            addPostToGroup(groupId, newPost);
        }

        resetForm();
        navigation.goBack();
    };

    const handleEmojiSelect = (emojiObject) => {
        setContent((prev) => prev + emojiObject.emoji);
    };

    const getPrivacyIcon = () => {
        switch (privacy) {
            case 'public': return 'earth';
            case 'friends': return 'people';
            case 'private': return 'lock-closed';
            default: return 'earth';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.leftBtn}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>Tạo bài viết</Text>
                    {/* Hiển thị đang đăng trong nhóm nào (nếu có) */}
                    {groupName && (
                        <Text style={styles.subTitle}>▶ {groupName}</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.postButton, (!content && images.length === 0) && styles.disabledBtn]}
                    disabled={!content && images.length === 0}
                    onPress={handlePost}
                >
                    <Text style={[styles.postButtonText, (!content && images.length === 0) && styles.disabledText]}>
                        Đăng
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* User Info */}
                    <View style={styles.userSection}>
                        <Image
                            source={{ uri: userProfile?.photoURL || 'https://i.pravatar.cc/150?img=3' }}
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {userProfile?.displayName || 'Người dùng'}
                            </Text>
                            <TouchableOpacity style={styles.privacySelector}>
                                <Ionicons name={getPrivacyIcon()} size={14} color="#666" />
                                <Text style={styles.privacyText}>
                                    {privacy === 'public' ? 'Công khai' : privacy === 'friends' ? 'Bạn bè' : 'Riêng tư'}
                                </Text>
                                <Ionicons name="chevron-down" size={14} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Input */}
                    <TextInput
                        style={styles.textInput}
                        placeholder={`${userProfile?.displayName?.split(' ').pop() || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                        placeholderTextColor="#999"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />

                    {/* Images */}
                    {images.length > 0 && (
                        <View style={styles.imagesGrid}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => removeImage(index)}
                                    >
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
                        <TouchableOpacity style={styles.gridItem} onPress={pickImage}>
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

                        <TouchableOpacity style={styles.gridItem}>
                            <Ionicons name="location" size={24} color="#F44336" />
                            <Text style={styles.gridLabel}>Check-in</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <EmojiPicker
                    onEmojiSelected={handleEmojiSelect}
                    open={isEmojiOpen}
                    onClose={() => setIsEmojiOpen(false)}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff'
    },
    leftBtn: { padding: 5, width: 40 },
    titleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#333' },
    subTitle: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#666' },
    postButton: { backgroundColor: '#2F847C', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    postButtonText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 15 },
    disabledBtn: { backgroundColor: '#E0E0E0' },
    disabledText: { color: '#999' },

    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },

    userSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#eee' },
    userInfo: { flex: 1 },
    userName: { fontFamily: 'Nunito-Bold', fontSize: 17, color: '#333', marginBottom: 4 },
    privacySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', gap: 4 },
    privacyText: { fontSize: 13, fontFamily: 'Nunito-Regular', color: '#666' },

    textInput: { fontSize: 18, fontFamily: 'Nunito-Regular', color: '#333', minHeight: 120, marginBottom: 20 },

    imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    imageWrapper: { width: '48%', aspectRatio: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },

    toolbarContainer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', padding: 16, backgroundColor: '#fff' },
    toolbarTitle: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#333', marginBottom: 12 },
    gridToolbar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
    gridItem: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, gap: 10 },
    gridLabel: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#333' }
});

export default PostScreen;