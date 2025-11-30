import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform,
    FlatList, Image, Keyboard, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '@/components/CustomHeader';
import CommunityPostCard from '../components/CommunityPostCard';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';

const PostDetailScreen = ({ route, navigation }) => {
    const { post: initialPost } = route.params;
    const { user, userProfile } = useUserStore();
    const { addCommentToPost, posts } = useCommunityStore();

    const [commentText, setCommentText] = useState('');

    // ✅ REALTIME DATA: Tìm bài viết trong Store để luôn cập nhật trạng thái mới nhất
    const currentPost = posts.find(p => p.id === initialPost.id) || initialPost;
    const comments = currentPost.comments || [];

    const handleSendComment = async () => {
        if (!commentText.trim()) return;

        if (!user?.uid) {
            Alert.alert("Yêu cầu", "Vui lòng đăng nhập để bình luận.");
            return;
        }

        Keyboard.dismiss(); // Ẩn bàn phím

        const newComment = {
            userId: user.uid,
            userName: userProfile?.displayName || 'Người dùng',
            userAvatar: userProfile?.photoURL || null,
            text: commentText.trim(),
            createdAt: new Date().toISOString(),
        };

        try {
            await addCommentToPost(currentPost.id, newComment);
            setCommentText('');
        } catch (error) {
            console.error("Lỗi gửi comment:", error);
        }
    };

    const renderCommentItem = ({ item, index }) => (
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

    const renderHeader = () => (
        <View style={styles.postContainer}>
            <CommunityPostCard post={currentPost} />
            <View style={styles.commentHeader}>
                <Text style={styles.sectionTitle}>Bình luận ({comments.length})</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Chi tiết bài viết" showBackButton={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <FlatList
                    data={comments}
                    // Key unique để tránh lặp
                    keyExtractor={(item, index) => item.createdAt + index}
                    renderItem={renderCommentItem}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                {/* Input Bar đẹp hơn, không bị che */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Viết bình luận..."
                        placeholderTextColor="#999"
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !commentText.trim() && styles.disabledBtn]}
                        onPress={handleSendComment}
                        disabled={!commentText.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    listContent: { paddingBottom: 20 },
    postContainer: { marginBottom: 10 },

    commentHeader: { paddingHorizontal: 16, paddingBottom: 10 },
    sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },

    // Comment Item
    commentItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 12 },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#eee' },
    defaultAvatar: { backgroundColor: '#BDBDBD', justifyContent: 'center', alignItems: 'center' },
    commentContent: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    commentUser: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#222', marginBottom: 2 },
    commentText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#444', lineHeight: 20 },

    // Input Bar
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#eee',
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        elevation: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: -2 }
    },
    input: {
        flex: 1, backgroundColor: '#F5F6F8', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
        maxHeight: 100, fontSize: 15, fontFamily: 'Nunito-Regular', marginRight: 10, color: '#333'
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#2F847C',
        justifyContent: 'center', alignItems: 'center', elevation: 2
    },
    disabledBtn: { backgroundColor: '#E0E0E0', elevation: 0 }
});

export default PostDetailScreen;