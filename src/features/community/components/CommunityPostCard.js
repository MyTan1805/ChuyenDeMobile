// src/features/community/components/CommunityPostCard.js

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    Modal, TouchableWithoutFeedback, Alert, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { useCommunityStore } from '@/store/communityStore';
import { useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { shareContent } from '@/utils/shareUtils';

const CommunityPostCard = ({ post }) => {
    if (!post || !post.id) return null;

    const navigation = useNavigation();
    const { user } = useUserStore();
    const { toggleLikePost, deletePost, hidePost, getPostById, reportPost } = useCommunityStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const currentPost = getPostById(post.id) || post;

    const isLiked = Array.isArray(currentPost.likes) && user?.uid
        ? currentPost.likes.includes(user.uid)
        : false;

    const likeCount = Array.isArray(currentPost.likes) ? currentPost.likes.length : 0;
    const commentCount = Array.isArray(currentPost.comments) ? currentPost.comments.length : 0;

    let mediaList = [];
    if (currentPost.images && currentPost.images.length > 0) {
        mediaList = currentPost.images;
    } else if (currentPost.image) {
        mediaList = [{ uri: currentPost.image, type: 'image' }];
    }

    const handleLike = () => {
        if (!user?.uid) {
            Alert.alert("Thông báo", "Vui lòng đăng nhập để thích bài viết.");
            return;
        }
        toggleLikePost(post.id, user.uid);
    };

    const handleEdit = () => {
        setModalVisible(false);
        navigation.navigate('Đăng tin', { isEdit: true, existingPost: currentPost });
    };

    const handleDelete = async () => {
        setModalVisible(false);
        Alert.alert(
            "Xóa bài viết",
            "Bạn có chắc chắn muốn xóa?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        await deletePost(post.id);
                        setIsDeleting(false);
                    }
                }
            ]
        );
    };

    const handleHide = () => {
        setModalVisible(false);
        hidePost(post.id);
    };

    const handleReport = () => {
        setModalVisible(false);
        setReportModalVisible(true);
    };

    const handleShare = () => {
        shareContent({
            title: `Bài viết của ${post.userName}`,
            message: post.content,
            path: `post/${post.id}` // Deep link
        });
    };

    const submitReport = async () => {
        if (!reportReason.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập lý do báo cáo");
            return;
        }

        const result = await reportPost(post.id, reportReason.trim(), user?.uid);
        setReportModalVisible(false);
        setReportReason('');

        if (result.success) {
            Alert.alert(
                "Đã gửi báo cáo",
                "Cảm ơn bạn đã giúp chúng tôi duy trì môi trường cộng đồng lành mạnh."
            );
        } else {
            Alert.alert("Thông báo", result.error);
        }
    };

    const handleGroupPress = () => {
        if (currentPost.groupId) {
            navigation.navigate('GroupDetail', { groupId: currentPost.groupId });
        }
    };

    const renderAvatar = () => {
        if (post.userAvatar) {
            return <Image source={{ uri: post.userAvatar }} style={styles.avatar} />;
        }
        return (
            <View style={[styles.avatar, styles.defaultAvatar]}>
                <Ionicons name="person" size={20} color="#fff" />
            </View>
        );
    };

    const renderMediaSection = () => {
        if (mediaList.length === 0) return null;
        const media = mediaList[0];

        return (
            <View style={styles.singleMediaContainer}>
                {media.type === 'video' ? (
                    <Video
                        source={{ uri: media.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode={ResizeMode.COVER}
                        useNativeControls={false}
                        shouldPlay={false}
                    />
                ) : (
                    <Image
                        source={{ uri: media.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                )}
            </View>
        );
    };

    const renderOptionModal = () => (
        <Modal
            transparent={true}
            visible={modalVisible}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {(user?.uid === post.userId) ? (
                            <>
                                <TouchableOpacity style={styles.modalItem} onPress={handleEdit}>
                                    <Ionicons name="create-outline" size={20} color="#2F847C" />
                                    <Text style={[styles.modalText, { color: '#2F847C' }]}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalItem} onPress={handleDelete}>
                                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                                    <Text style={[styles.modalText, { color: '#FF5252' }]}>Xóa bài viết</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.modalItem} onPress={handleHide}>
                                    <Ionicons name="eye-off-outline" size={20} color="#333" />
                                    <Text style={styles.modalText}>Ẩn bài viết</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalItem} onPress={handleReport}>
                                    <Ionicons name="flag-outline" size={20} color="#FF9800" />
                                    <Text style={[styles.modalText, { color: '#FF9800' }]}>Báo cáo vi phạm</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const renderReportModal = () => (
        <Modal
            transparent={true}
            visible={reportModalVisible}
            animationType="slide"
            onRequestClose={() => setReportModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.reportModalContent}>
                            <Text style={styles.reportTitle}>Báo cáo vi phạm</Text>
                            <Text style={styles.reportDesc}>
                                Vui lòng cho chúng tôi biết lý do báo cáo bài viết này
                            </Text>

                            <TextInput
                                style={styles.reportInput}
                                placeholder="VD: Spam, nội dung không phù hợp..."
                                multiline
                                numberOfLines={4}
                                value={reportReason}
                                onChangeText={setReportReason}
                                textAlignVertical="top"
                            />

                            <View style={styles.reportActions}>
                                <TouchableOpacity
                                    style={styles.reportCancelBtn}
                                    onPress={() => {
                                        setReportModalVisible(false);
                                        setReportReason('');
                                    }}
                                >
                                    <Text style={styles.reportCancelText}>Hủy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.reportSubmitBtn}
                                    onPress={submitReport}
                                >
                                    <Text style={styles.reportSubmitText}>Gửi báo cáo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                {renderAvatar()}
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{post.userName}</Text>
                    {post.groupName && (
                        <TouchableOpacity
                            onPress={handleGroupPress}
                            style={styles.groupBadge}
                        >
                            <Ionicons name="people" size={12} color="#2F847C" />
                            <Text style={styles.groupName}> {post.groupName}</Text>
                        </TouchableOpacity>
                    )}
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
                {renderMediaSection()}
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={isLiked ? "#E91E63" : "#555"}
                    />
                    <Text style={[styles.actionText, isLiked && { color: "#E91E63" }]}>
                        {likeCount > 0 ? likeCount : 'Thích'}
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
            {renderReportModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#E0E0E0'
    },
    defaultAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#BDBDBD'
    },
    userInfo: { flex: 1 },
    userName: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#333'
    },
    groupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2F1',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginTop: 4,
        alignSelf: 'flex-start'
    },
    groupName: {
        fontFamily: 'Nunito-Bold',
        fontSize: 12,
        color: '#2F847C'
    },
    time: {
        fontFamily: 'Nunito-Regular',
        fontSize: 12,
        color: '#9E9E9E',
        marginTop: 2
    },
    optionBtn: { padding: 5 },
    content: {
        fontFamily: 'Nunito-Regular',
        fontSize: 15,
        color: '#333',
        marginBottom: 12,
        lineHeight: 22
    },
    singleMediaContainer: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#000'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        paddingTop: 12
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8
    },
    actionText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 14,
        color: '#555'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '80%',
        padding: 10,
        elevation: 5
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    modalText: {
        marginLeft: 15,
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#333'
    },
    reportModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        elevation: 5
    },
    reportTitle: {
        fontSize: 20,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginBottom: 8
    },
    reportDesc: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
        color: '#666',
        marginBottom: 16,
        lineHeight: 20
    },
    reportInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        fontSize: 15,
        fontFamily: 'Nunito-Regular',
        color: '#333',
        marginBottom: 16
    },
    reportActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    reportCancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center'
    },
    reportCancelText: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#666'
    },
    reportSubmitBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#FF9800',
        alignItems: 'center'
    },
    reportSubmitText: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#fff'
    }
});

export default CommunityPostCard;