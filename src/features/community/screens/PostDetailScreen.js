// src/features/community/screens/PostDetailScreen.js

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform,
    FlatList, Image, Keyboard, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '@/components/CustomHeader';
import CommunityPostCard from '../components/CommunityPostCard';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
import { auth } from '@/config/firebaseConfig';

const PostDetailScreen = ({ route, navigation }) => {
    // ✅ FIX 1: Lấy an toàn cả post object VÀ postId từ params
    const { post: initialPost, postId } = route.params || {};

    const { userProfile } = useUserStore();
    const { addCommentToPost, posts, getPostById } = useCommunityStore();

    const [commentText, setCommentText] = useState('');
    const [isSending, setIsSending] = useState(false);

    // ✅ FIX 2: Logic tìm bài viết thông minh
    // Ưu tiên lấy từ Store (Realtime) dựa trên ID để dữ liệu luôn mới nhất
    // Nếu không có trong store, dùng dữ liệu truyền qua navigation (initialPost)
    const targetId = initialPost?.id || postId;
    const currentPost = posts.find(p => p.id === targetId) || initialPost;

    // ✅ FIX 3: Nếu vẫn không tìm thấy bài viết (ví dụ ID sai hoặc đã bị xóa), hiển thị thông báo thay vì Crash
    if (!currentPost) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Chi tiết bài viết" showBackButton={true} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>
                        Không tìm thấy bài viết hoặc bài viết đã bị xóa.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
                        <Text style={styles.goBackText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const comments = currentPost.comments || [];

    const handleSendComment = async () => {
        if (!commentText.trim() || isSending) return;

        setIsSending(true);

        const currentUser = auth.currentUser;
        const userId = userProfile?.uid || currentUser?.uid || 'guest_id';
        const userName = userProfile?.displayName || currentUser?.displayName || 'Người dùng ẩn danh';
        const userAvatar = userProfile?.photoURL || currentUser?.photoURL || null;

        const textToSend = commentText.trim();
        setCommentText(''); // Xóa input ngay lập tức để UX mượt
        Keyboard.dismiss();

        const newComment = {
            userId: userId,
            userName: userName,
            userAvatar: userAvatar,
            text: textToSend,
            createdAt: new Date().toISOString(),
        };

        try {
            await addCommentToPost(currentPost.id, newComment);
        } catch (error) {
            console.error("Lỗi gửi comment:", error);
            Alert.alert("Lỗi", "Không thể gửi bình luận lúc này.");
            setCommentText(textToSend); // Trả lại text nếu lỗi
        } finally {
            setIsSending(false);
        }
    };

    const renderCommentItem = ({ item }) => (
        <View style={styles.commentItem}>
            {item.userAvatar ? (
                <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
            ) : (
                <View style={[styles.commentAvatar, styles.defaultAvatar]}>
                    <Ionicons name="person" size={14} color="#fff" />
                </View>
            )}
            <View style={styles.commentContent}>
                <Text style={styles.commentUser}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </View>
    );

    const renderListHeader = () => (
        <View style={styles.postWrapper}>
            {/* Component PostCard đã được bảo vệ */}
            <CommunityPostCard post={currentPost} />
            <View style={styles.commentSectionHeader}>
                <Text style={styles.sectionTitle}>Bình luận ({comments.length})</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Chi tiết bài viết" showBackButton={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <FlatList
                    data={comments}
                    // KeyExtractor an toàn
                    keyExtractor={(item, index) => (item.createdAt || index) + index.toString()}
                    renderItem={renderCommentItem}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Viết bình luận..."
                        placeholderTextColor="#999"
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        maxLength={500}
                        editable={!isSending}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendBtn,
                            (!commentText.trim() || isSending) && styles.disabledBtn
                        ]}
                        onPress={handleSendComment}
                        disabled={!commentText.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 2 }} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    listContent: { paddingBottom: 20 },
    postWrapper: { marginBottom: 10 },
    commentSectionHeader: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: '#F7F9FC'
    },
    sectionTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#333',
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    commentAvatar: {
        width: 36, height: 36, borderRadius: 18, marginRight: 10,
        backgroundColor: '#eee', borderWidth: 1, borderColor: '#fff'
    },
    defaultAvatar: {
        backgroundColor: '#BDBDBD',
        justifyContent: 'center', alignItems: 'center'
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
        elevation: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
    },
    commentUser: {
        fontFamily: 'Nunito-Bold',
        fontSize: 13,
        color: '#222',
        marginBottom: 2
    },
    commentText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: '#444',
        lineHeight: 20
    },
    emptyContainer: { alignItems: 'center', padding: 20, marginTop: 20 },
    emptyText: { color: '#999', fontFamily: 'Nunito-Regular', fontStyle: 'italic', marginBottom: 15 },
    goBackBtn: { padding: 10, backgroundColor: '#2F847C', borderRadius: 8 },
    goBackText: { color: '#fff', fontFamily: 'Nunito-Bold' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#eee',
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 5
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F6F8',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        fontFamily: 'Nunito-Regular',
        marginRight: 10,
        color: '#333'
    },
    sendBtn: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#2F847C',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#2F847C", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3
    },
    disabledBtn: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0, elevation: 0
    }
});

export default PostDetailScreen;