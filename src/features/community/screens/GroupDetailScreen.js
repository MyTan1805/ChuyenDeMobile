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
    const [fetchError, setFetchError] = useState(null);

    const [memberDetails, setMemberDetails] = useState({});
    const [loadingMembers, setLoadingMembers] = useState(false);

    const validPosts = useMemo(() => {
        return Array.isArray(groupPosts) ? groupPosts.filter(p => p && p.id) : [];
    }, [groupPosts]);

    // Effect 1: Lấy thông tin Group
    useEffect(() => {
        const updateGroup = () => {
            const latestGroup = getGroupById(groupId);
            setGroup(latestGroup);
        };
        updateGroup();
        const unsubscribe = useGroupStore.subscribe(updateGroup);
        return () => unsubscribe();
    }, [groupId, getGroupById]);

    // Effect 2: Lấy bài viết trong Group (ĐÃ SỬA LỖI CRASH)
    useEffect(() => {
        // fetchGroupPosts bây giờ trả về một hàm (function), không phải Promise (Object)
        const unsubscribeFunc = fetchGroupPosts(groupId, (posts) => {
            setGroupPosts(posts);
            setFetchError(null);
        });

        // Cleanup function chuẩn cho useEffect
        return () => {
            if (typeof unsubscribeFunc === 'function') {
                unsubscribeFunc();
            }
        };
    }, [groupId]);

    // Effect 3: Lấy thông tin thành viên
    useEffect(() => {
        const fetchMembersData = async () => {
            if (!group?.membersList || !Array.isArray(group.membersList) || group.membersList.length === 0) {
                setLoadingMembers(false);
                return;
            }
            setLoadingMembers(true);
            const details = { ...memberDetails };
            const promises = [];

            group.membersList.forEach(uid => {
                if (uid && typeof uid === 'string' && uid.trim() !== '' && !details[uid]) {
                    const promise = getDoc(doc(db, "users", uid))
                        .then(docSnap => {
                            if (docSnap.exists()) details[uid] = docSnap.data();
                        })
                        .catch(e => console.error(`Lỗi fetch user ${uid}:`, e));
                    promises.push(promise);
                }
            });

            if (promises.length > 0) {
                await Promise.all(promises);
                setMemberDetails(details);
            }
            setLoadingMembers(false);
        };

        if (group) fetchMembersData();
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
    const isPublicGroup = !group?.isPrivate;

    const handleJoinLeave = () => {
        if (isMember) {
            Alert.alert(
                "Rời nhóm",
                `Bạn có chắc muốn rời khỏi nhóm "${group.name}"?`,
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Rời nhóm", style: "destructive",
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

    // --- Render Functions ---
    const renderAboutTab = () => (
        <View style={styles.tabContent}>
            {/* 1. Phần Giới thiệu (Đã có) */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={24} color="#2F847C" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Giới thiệu</Text>
                        <Text style={styles.infoValue}>{group.description || "Chưa có mô tả"}</Text>
                    </View>
                </View>
            </View>

            {/* 2. Phần Khu vực hoạt động (Mới thêm) */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={24} color="#FF9800" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Khu vực hoạt động</Text>
                        <Text style={styles.infoValue}>{group.location || "Toàn quốc"}</Text>
                        {/* Hiển thị chi tiết nếu có */}
                        {(group.ward || group.district || group.city) && (
                            <Text style={[styles.infoValue, { fontSize: 13, color: '#888', marginTop: 2 }]}>
                                {[group.ward, group.district, group.city].filter(Boolean).join(', ')}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* 3. Phần Quyền riêng tư (Mới thêm) */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons
                        name={group.isPrivate ? "lock-closed-outline" : "earth-outline"}
                        size={24}
                        color={group.isPrivate ? "#D32F2F" : "#2196F3"}
                    />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Quyền riêng tư</Text>
                        <Text style={styles.infoValue}>
                            {group.isPrivate ? "Nhóm Riêng Tư" : "Nhóm Công Khai"}
                        </Text>
                        <Text style={[styles.infoValue, { fontSize: 13, color: '#888', marginTop: 2 }]}>
                            {group.isPrivate
                                ? "Chỉ thành viên mới xem được bài viết."
                                : "Bất kỳ ai cũng có thể xem bài viết."}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPostsTab = () => (
        <View style={styles.tabContent}>
            {(isMember || isPublicGroup) ? (
                validPosts.length > 0 ? (
                    <FlatList
                        data={validPosts}
                        renderItem={({ item }) => <CommunityPostCard post={item} />}
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
                    <Text style={styles.memberName}>{isMe ? "Bạn" : displayName}</Text>
                    <Text style={styles.memberRole}>{isAdminMember ? "Quản trị viên" : "Thành viên"}</Text>
                </View>
            </View>
        );
    };

    const renderMembersTab = () => (
        <View style={styles.tabContent}>
            {loadingMembers ? (
                <ActivityIndicator size="small" color="#2F847C" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={group.membersList}
                    renderItem={renderMemberItem}
                    keyExtractor={(item, index) => item || index.toString()}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có thành viên nào</Text>
                        </View>
                    }
                />
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
                <View style={styles.coverSection}>
                    <Image source={{ uri: group.image || 'https://via.placeholder.com/500' }} style={styles.coverImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gradient}>
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            <Text style={styles.groupMetaText}>{(group.members || 0).toLocaleString()} thành viên</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleJoinLeave}>
                        <Ionicons name={isMember ? "exit-outline" : "add"} size={20} color="#fff" />
                        <Text style={styles.primaryBtnText}>{isMember ? "Rời nhóm" : "Tham gia"}</Text>
                    </TouchableOpacity>
                    {isMember && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.secondaryBtn]}
                            onPress={() => navigation.navigate('Đăng tin', {
                                fromCommunity: true,
                                groupId: group.id,
                                groupName: group.name,
                                groupIsPrivate: group.isPrivate // ✅ THÊM: Truyền cờ private sang
                            })}
                        >
                            <Ionicons name="create-outline" size={24} color="#2F847C" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.tabsContainer}>
                    {['about', 'posts', 'members'].map(tab => (
                        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab === 'about' ? 'Giới thiệu' : tab === 'posts' ? 'Bài viết' : 'Thành viên'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'about' && renderAboutTab()}
                {activeTab === 'posts' && renderPostsTab()}
                {activeTab === 'members' && renderMembersTab()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    coverSection: { height: 250, position: 'relative' },
    coverImage: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 50 },
    groupInfo: { marginBottom: 5 },
    groupName: { fontSize: 26, fontFamily: 'Nunito-Bold', color: '#fff', marginBottom: 8 },
    groupMetaText: { fontSize: 14, color: '#fff', fontFamily: 'Nunito-Regular' },
    actionsContainer: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#fff' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, gap: 8 },
    primaryBtn: { flex: 1, backgroundColor: '#2F847C' },
    primaryBtnText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16 },
    secondaryBtn: { backgroundColor: '#E0F2F1', width: 54 },
    tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#2F847C' },
    tabText: { fontSize: 15, fontFamily: 'Nunito-Regular', color: '#999' },
    activeTabText: { fontFamily: 'Nunito-Bold', color: '#2F847C' },
    tabContent: { padding: 16 },
    infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    infoText: { flex: 1 },
    infoLabel: { fontSize: 13, fontFamily: 'Nunito-Bold', color: '#666', marginBottom: 4 },
    infoValue: { fontSize: 15, fontFamily: 'Nunito-Regular', color: '#333', lineHeight: 22 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 16, fontSize: 16, fontFamily: 'Nunito-Regular', color: '#999', textAlign: 'center' },
    memberItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, elevation: 1 },
    memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CFD8DC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    memberAvatarImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 15, fontFamily: 'Nunito-Bold', color: '#333' },
    memberRole: { fontSize: 12, fontFamily: 'Nunito-Regular', color: '#757575' }
});

export default GroupDetailScreen;