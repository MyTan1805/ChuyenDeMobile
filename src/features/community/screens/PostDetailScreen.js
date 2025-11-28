// ✅ FIX: Bình luận được lưu vào store và hiển thị đúng
// src/features/community/screens/PostDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';

const PostDetailScreen = ({ route, navigation }) => {
    const { post } = route.params;
    const { userProfile } = useUserStore();
    const { addCommentToPost, toggleLike } = useCommunityStore(); // ✅ Lấy hàm từ store

    // ✅ Lấy comments từ post (đã được cập nhật qua store)
    const [comments, setComments] = useState(post.comments || []);
    const [inputComment, setInputComment] = useState('');

    // ✅ Cập nhật comments khi post thay đổi
    useEffect(() => {
        setComments(post.comments || []);
    }, [post.comments]);

    const handleSend = () => {
        if (!inputComment.trim()) return;

        const newComment = {
            id: Date.now().toString(),
            user: userProfile?.displayName || 'Tôi',
            avatar: userProfile?.photoURL || 'https://i.pravatar.cc/150?img=3',
            content: inputComment,
            time: 'Vừa xong'
        };

        // ✅ Gọi hàm lưu comment vào store
        addCommentToPost(post.id, newComment);

        // Cập nhật UI local
        setComments([newComment, ...comments]);
        setInputComment('');
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentItem}>
            <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
            <View style={styles.commentBubble}>
                <Text style={styles.commentUser}>{item.user}</Text>
                <Text style={styles.commentContent}>{item.content}</Text>
                <Text style={styles.commentTime}>{item.time}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Bài viết" showBackButton={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* --- Post Content --- */}
                    <View style={styles.postContainer}>
                        <View style={styles.header}>
                            <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
                            <View>
                                <Text style={styles.userName}>{post.userName}</Text>
                                <Text style={styles.time}>{post.time}</Text>
                            </View>
                        </View>
                        <Text style={styles.content}>{post.content}</Text>
                        {post.image && (
                            <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
                        )}

                        <View style={styles.statsRow}>
                            <TouchableOpacity
                                style={styles.stat}
                                onPress={() => toggleLike(post.id)}
                            >
                                <Ionicons
                                    name={post.isLiked ? "heart" : "heart-outline"}
                                    size={24}
                                    color={post.isLiked ? "#E91E63" : "#555"}
                                />
                                <Text style={[styles.statText, post.isLiked && { color: "#E91E63", fontWeight: 'bold' }]}>
                                    {post.likes} lượt thích
                                </Text>
                            </TouchableOpacity>

                            {/* ✅ Hiển thị số comment động */}
                            <Text style={styles.statText}>{comments.length} bình luận</Text>
                        </View>
                    </View>

                    {/* --- Comments List --- */}
                    <View style={styles.commentsSection}>
                        <Text style={styles.sectionTitle}>Bình luận ({comments.length})</Text>

                        {comments.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </Text>
                        ) : (
                            comments.map(item => (
                                <View key={item.id}>{renderComment({ item })}</View>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* --- Input Bar --- */}
                <View style={styles.inputBar}>
                    <Image
                        source={{ uri: userProfile?.photoURL || 'https://i.pravatar.cc/150?img=3' }}
                        style={styles.myAvatar}
                    />
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Viết bình luận..."
                            value={inputComment}
                            onChangeText={setInputComment}
                            multiline
                        />
                        <TouchableOpacity onPress={handleSend}>
                            <Ionicons name="send" size={20} color="#2F847C" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    scrollContent: { paddingBottom: 80 },
    postContainer: { backgroundColor: '#fff', padding: 16, marginBottom: 10 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#e0e0e0' },
    userName: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    time: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#888' },
    content: { fontFamily: 'Nunito-Regular', fontSize: 15, marginBottom: 12, lineHeight: 22, color: '#333' },
    postImage: { width: '100%', height: 300, borderRadius: 12 },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10
    },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statText: { fontFamily: 'Nunito-Regular', color: '#666', fontSize: 13 },

    commentsSection: { backgroundColor: '#fff', padding: 16, minHeight: 300 },
    sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, marginBottom: 15, color: '#333' },
    commentItem: { flexDirection: 'row', marginBottom: 15 },
    commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#e0e0e0' },
    commentBubble: { flex: 1, backgroundColor: '#F0F2F5', borderRadius: 12, padding: 10 },
    commentUser: { fontFamily: 'Nunito-Bold', fontSize: 13, marginBottom: 2, color: '#333' },
    commentContent: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#333' },
    commentTime: { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#999', marginTop: 4 },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    myAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#e0e0e0' },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F0F2F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        alignItems: 'center'
    },
    input: { flex: 1, fontSize: 14, fontFamily: 'Nunito-Regular', maxHeight: 80, color: '#333' },
});

export default PostDetailScreen;