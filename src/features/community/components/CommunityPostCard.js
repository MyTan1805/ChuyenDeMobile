// src/features/community/components/CommunityPostCard.js

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    Share, Modal, TouchableWithoutFeedback, Alert, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
import { useNavigation } from '@react-navigation/native';

const CommunityPostCard = ({ post }) => {
    const navigation = useNavigation();
    const { user } = useUserStore();
    const { toggleLike, deletePost, hidePost, getPostById } = useCommunityStore();
    const [modalVisible, setModalVisible] = useState(false);

    const isOwner = user?.uid === post.userId;
    const currentPost = getPostById(post.id) || post;
    const commentCount = currentPost.comments?.length || 0;

    const imageList = currentPost.images && currentPost.images.length > 0
        ? currentPost.images
        : (currentPost.image ? [currentPost.image] : []);

    const handleLike = () => toggleLike(post.id);
    const handleShare = async () => { /* Logic share */ };
    const handleDelete = () => {
        setModalVisible(false);
        Alert.alert("Xóa bài", "Xóa bài viết này?", [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: () => deletePost(post.id) }
        ]);
    };
    const handleHide = () => {
        setModalVisible(false);
        hidePost(post.id);
    };

    const renderOptionModal = () => (
        <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {isOwner ? (
                            <TouchableOpacity style={styles.modalItem} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={20} color="#FF5252" />
                                <Text style={[styles.modalText, { color: '#FF5252' }]}>Xóa bài viết</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.modalItem} onPress={handleHide}>
                                <Ionicons name="eye-off-outline" size={20} color="#333" />
                                <Text style={styles.modalText}>Ẩn bài viết</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const renderImages = () => {
        if (imageList.length === 0) return null;
        if (imageList.length === 1) {
            return <Image source={{ uri: imageList[0] }} style={styles.singleImage} resizeMode="cover" />;
        }
        if (imageList.length === 2) {
            return (
                <View style={styles.rowImages}>
                    <Image source={{ uri: imageList[0] }} style={[styles.halfImage, { marginRight: 4 }]} />
                    <Image source={{ uri: imageList[1] }} style={styles.halfImage} />
                </View>
            );
        }
        return (
            <View style={styles.gridImages}>
                {imageList.slice(0, 4).map((img, index) => (
                    <Image key={index} source={{ uri: img }} style={styles.gridImageItem} />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    {/* ✅ SỬA: Hiển thị tên nhóm nếu bài viết được đăng trong nhóm */}
                    <View style={styles.userGroupRow}>
                        <Text style={styles.userName}>{post.userName}</Text>
                        {post.groupName && (
                            <>
                                <Ionicons name="caret-forward" size={14} color="#999" style={{ marginHorizontal: 4 }} />
                                <Text style={styles.groupName} numberOfLines={1} ellipsizeMode='tail'>{post.groupName}</Text>
                            </>
                        )}
                    </View>
                    <Text style={styles.time}>{post.time}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.optionBtn}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#757575" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate('PostDetail', { post: currentPost })}
                activeOpacity={0.9}
            >
                <Text style={styles.content} numberOfLines={3}>{post.content}</Text>
                {renderImages()}
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Ionicons
                        name={currentPost.isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={currentPost.isLiked ? "#E91E63" : "#555"}
                    />
                    <Text style={[styles.actionText, currentPost.isLiked && { color: "#E91E63" }]}>
                        {currentPost.likes > 0 ? currentPost.likes : 'Thích'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('PostDetail', { post: currentPost })}
                >
                    <Ionicons name="chatbubble-outline" size={22} color="#555" />
                    <Text style={styles.actionText}>
                        {commentCount > 0 ? commentCount : 'Bình luận'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Ionicons name="share-social-outline" size={22} color="#555" />
                    <Text style={styles.actionText}>Chia sẻ</Text>
                </TouchableOpacity>
            </View>

            {renderOptionModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#E0E0E0' },
    userInfo: { flex: 1 },

    // Style mới cho dòng tên User và tên Nhóm
    userGroupRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    userName: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    groupName: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#555', maxWidth: 150 }, // Giới hạn chiều rộng tên nhóm

    time: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9E9E9E' },
    optionBtn: { padding: 5 },
    content: { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#333', marginBottom: 12, lineHeight: 22 },

    singleImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 12 },
    rowImages: { flexDirection: 'row', height: 200, marginBottom: 12 },
    halfImage: { flex: 1, height: '100%', borderRadius: 8 },
    gridImages: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 },
    gridImageItem: { width: '48%', height: 150, borderRadius: 8 },

    footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
    actionText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#555' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', borderRadius: 16, width: '80%', padding: 10, elevation: 5 },
    modalItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalText: { marginLeft: 15, fontSize: 16, fontFamily: 'Nunito-Regular', color: '#333' }
});

export default CommunityPostCard;