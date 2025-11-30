// src/features/community/screens/GroupDetailScreen.js

import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    Alert, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '@/components/CustomHeader';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';
import CommunityPostCard from '../components/CommunityPostCard';
import { useCommunityStore } from '@/store/communityStore';

// ✅ Import thêm để lấy info user từ Firestore
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const GroupDetailScreen = ({ route, navigation }) => {
    const { groupId } = route.params;
    const { user } = useUserStore();
    const { getGroupById, joinGroup, leaveGroup, isUserInGroup } = useGroupStore();
    const { fetchGroupPosts } = useCommunityStore();

    const [activeTab, setActiveTab] = useState('about');
    const [group, setGroup] = useState(null);
    const [groupPosts, setGroupPosts] = useState([]);

    // ✅ State mới để lưu thông tin chi tiết các thành viên (Cache: { uid: userData })
    const [memberDetails, setMemberDetails] = useState({});
    const [loadingMembers, setLoadingMembers] = useState(false);

    // ✅ FIX: Lọc bỏ các bài viết bị null/undefined để tránh crash FlatList
    const validPosts = useMemo(() => {
        return Array.isArray(groupPosts) ? groupPosts.filter(p => p && p.id) : [];
    }, [groupPosts]);

    useEffect(() => {
        const updateGroup = () => {
            const latestGroup = getGroupById(groupId);
            setGroup(latestGroup);
        };
        updateGroup();
        // Subscribe để cập nhật realtime nếu store thay đổi
        const unsubscribe = useGroupStore.subscribe(updateGroup);
        return () => unsubscribe();
    }, [groupId, getGroupById]);

    useEffect(() => {
        const unsubPosts = fetchGroupPosts(groupId, (posts) => {
            setGroupPosts(posts);
        });
        return () => unsubPosts && unsubPosts();
    }, [groupId]);

    // ✅ EFFECT: Tải thông tin chi tiết thành viên
    useEffect(() => {
        const fetchMembersData = async () => {
            if (!group?.membersList || group.membersList.length === 0) return;

            setLoadingMembers(true);
            const details = { ...memberDetails }; // Giữ lại cache cũ nếu có
            const promises = [];

            group.membersList.forEach(uid => {
                if (uid && !details[uid]) { // Check uid tồn tại
                    const promise = getDoc(doc(db, "users", uid)).then(docSnap => {
                        if (docSnap.exists()) {
                            details[uid] = docSnap.data();
                        }
                    }).catch(e => console.log("Err fetching member:", e));
                    promises.push(promise);
                }
            });

            if (promises.length > 0) {
                await Promise.all(promises);
                setMemberDetails(details);
            }
            setLoadingMembers(false);
        };

        if (group) {
            fetchMembersData();
        }
    }, [group?.membersList]);

    if (!group) {
        return (
            <View style={styles.errorContainer}>
                <ActivityIndicator size="small" color="#2F847C" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải thông tin nhóm...</Text>
            </View>
        );
    }

    const isMember = isUserInGroup(groupId);
    const isAdmin = group?.adminId === user?.uid;

    const handleJoinLeave = () => {
        if (isMember) {
            Alert.alert(
                "Rời nhóm",
                `Bạn có chắc muốn rời khỏi nhóm "${group.name}"?`,
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Rời nhóm",
                        style: "destructive",
                        onPress: () => {
                            const result = leaveGroup(groupId, user.uid);
                            if (result.success) Alert.alert("Thành công", "Đã rời nhóm");
                            else Alert.alert("Lỗi", result.error);
                        }
                    }
                ]
            );
        } else {
            const result = joinGroup(groupId, user.uid);
            if (result.success) Alert.alert("Thành công", `Đã tham gia nhóm "${group.name}"`);
        }
    };

    const renderAboutTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={24} color="#2F847C" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Giới thiệu</Text>
                        <Text style={styles.infoValue}>{group.description || "Chưa có mô tả"}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="map-outline" size={24} color="#F44336" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Khu vực</Text>
                        <Text style={styles.infoValue}>{group.location || "Toàn quốc"}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={24} color="#2196F3" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Thành viên</Text>
                        <Text style={styles.infoValue}>
                            {(group.members || 0).toLocaleString()} người
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={24} color="#FF9800" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Ngày tạo</Text>
                        <Text style={styles.infoValue}>
                            {group.createdAt && group.createdAt.seconds
                                ? new Date(group.createdAt.seconds * 1000).toLocaleDateString('vi-VN')
                                : "Mới tạo"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons
                        name={group.isPrivate ? "lock-closed-outline" : "globe-outline"}
                        size={24}
                        color="#9C27B0"
                    />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Quyền riêng tư</Text>
                        <Text style={styles.infoValue}>
                            {group.isPrivate ? "Nhóm riêng tư" : "Nhóm công khai"}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPostsTab = () => (
        <View style={styles.tabContent}>
            {isMember ? (
                validPosts.length > 0 ? (
                    <FlatList
                        data={validPosts}
                        renderItem={({ item }) => <CommunityPostCard post={item} />}
                        // ✅ FIX: Sử dụng optional chaining để tránh crash nếu item bị undefined
                        keyExtractor={item => item?.id || Math.random().toString()}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="post-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
                    </View>
                )
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="lock-closed-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>Tham gia nhóm để xem bài viết</Text>
                </View>
            )}
        </View>
    );

    const renderMemberItem = ({ item }) => {
        const uid = item;
        const isMe = uid === user?.uid;
        const isAdminMember = uid === group.adminId;

        const memberInfo = memberDetails[uid] || {};
        const displayName = memberInfo.displayName || "Người dùng";
        const avatarUrl = memberInfo.photoURL;

        return (
            <View style={styles.memberItem}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.memberAvatarImage} />
                ) : (
                    <View style={styles.memberAvatar}>
                        <Ionicons name="person" size={20} color="#fff" />
                    </View>
                )}

                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                        {isMe ? "Bạn" : displayName}
                    </Text>
                    <Text style={styles.memberRole}>
                        {isAdminMember ? "Quản trị viên" : "Thành viên"}
                    </Text>
                </View>

                {!isMe && (
                    <TouchableOpacity style={styles.messageBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2F847C" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderMembersTab = () => (
        <View style={styles.tabContent}>
            {loadingMembers ? (
                <ActivityIndicator size="small" color="#2F847C" style={{ marginTop: 20 }} />
            ) : (
                group.membersList && group.membersList.length > 0 ? (
                    <FlatList
                        data={group.membersList}
                        renderItem={renderMemberItem}
                        // ✅ FIX: item ở đây là UID string, nên dùng chính nó làm key
                        keyExtractor={(item, index) => item || index.toString()}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>
                            Chưa có thành viên nào
                        </Text>
                    </View>
                )
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader
                title="Chi tiết nhóm"
                showBackButton={true}
                showSettingsButton={isAdmin}
                onSettingsPress={() => navigation.navigate('EditGroup', { groupId })}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* --- HEADER ẢNH BÌA --- */}
                <View style={styles.coverSection}>
                    <Image source={{ uri: group.image || 'https://via.placeholder.com/500' }} style={styles.coverImage} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={styles.gradient}
                    >
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.name}</Text>

                            <View style={styles.metaContainer}>
                                <View style={styles.metaRow}>
                                    <Ionicons name="people" size={16} color="#fff" style={{ marginTop: 2 }} />
                                    <Text style={styles.groupMetaText}>
                                        {(group.members || 0).toLocaleString()} thành viên
                                    </Text>
                                </View>

                                <View style={styles.metaRow}>
                                    <Ionicons name="location" size={16} color="#fff" style={{ marginTop: 2 }} />
                                    <Text style={styles.groupMetaTextLocation}>
                                        {group.location || "Toàn quốc"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* --- ACTION BUTTONS --- */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.primaryBtn]}
                        onPress={handleJoinLeave}
                    >
                        <Ionicons
                            name={isMember ? "exit-outline" : "add"}
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.primaryBtnText}>
                            {isMember ? "Rời nhóm" : "Tham gia"}
                        </Text>
                    </TouchableOpacity>

                    {isMember && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.secondaryBtn]}
                            onPress={() => navigation.navigate('Đăng tin', {
                                fromCommunity: true,
                                groupId: group.id,
                                groupName: group.name
                            })}
                        >
                            <Ionicons name="create-outline" size={24} color="#2F847C" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.secondaryBtn]}
                        onPress={() => Alert.alert("Chia sẻ", "Link nhóm đã được sao chép!")}
                    >
                        <Ionicons name="share-social-outline" size={24} color="#2F847C" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                            Giới thiệu
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                        onPress={() => setActiveTab('posts')}
                    >
                        <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                            Bài viết
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'members' && styles.activeTab]}
                        onPress={() => setActiveTab('members')}
                    >
                        <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
                            Thành viên
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'about' && renderAboutTab()}
                {activeTab === 'posts' && renderPostsTab()}
                {activeTab === 'members' && renderMembersTab()}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    coverSection: { height: 280, position: 'relative' },
    coverImage: { width: '100%', height: '100%' },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingTop: 50
    },
    groupInfo: { marginBottom: 5 },
    groupName: {
        fontSize: 26,
        fontFamily: 'Nunito-Bold',
        color: '#fff',
        marginBottom: 8
    },

    metaContainer: {
        flexDirection: 'column',
        gap: 6
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingRight: 20
    },
    groupMetaText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Nunito-Regular'
    },
    groupMetaTextLocation: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Nunito-Regular',
        flex: 1,
        flexWrap: 'wrap'
    },

    actionsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: '#fff'
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: '#2F847C'
    },
    primaryBtnText: {
        color: '#fff',
        fontFamily: 'Nunito-Bold',
        fontSize: 16
    },
    secondaryBtn: {
        backgroundColor: '#E0F2F1',
        width: 54,
    },

    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center'
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#2F847C'
    },
    tabText: {
        fontSize: 15,
        fontFamily: 'Nunito-Regular',
        color: '#999'
    },
    activeTabText: {
        fontFamily: 'Nunito-Bold',
        color: '#2F847C'
    },

    tabContent: {
        padding: 16
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12
    },
    infoText: {
        flex: 1
    },
    infoLabel: {
        fontSize: 13,
        fontFamily: 'Nunito-Bold',
        color: '#666',
        marginBottom: 4
    },
    infoValue: {
        fontSize: 15,
        fontFamily: 'Nunito-Regular',
        color: '#333',
        lineHeight: 22
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#999',
        textAlign: 'center'
    },

    // --- Styles cho Member Item ---
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#CFD8DC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    memberAvatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontFamily: 'Nunito-Bold',
        color: '#333',
    },
    memberRole: {
        fontSize: 12,
        fontFamily: 'Nunito-Regular',
        color: '#757575',
    },
    messageBtn: {
        padding: 8,
    }
});

export default GroupDetailScreen;