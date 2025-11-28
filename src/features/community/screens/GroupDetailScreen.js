// src/features/community/screens/GroupDetailScreen.js

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    Alert, FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '@/components/CustomHeader';
import { useGroupStore } from '@/store/groupStore';
import { useUserStore } from '@/store/userStore';
import CommunityPostCard from '../components/CommunityPostCard';

const GroupDetailScreen = ({ route, navigation }) => {
    const { groupId } = route.params;
    const { user } = useUserStore();
    const { getGroupById, joinGroup, leaveGroup, isUserInGroup } = useGroupStore();

    const [activeTab, setActiveTab] = useState('about');
    const group = getGroupById(groupId);
    const isMember = isUserInGroup(groupId);
    const isAdmin = group?.adminId === user?.uid;

    if (!group) {
        return (
            <View style={styles.errorContainer}>
                <Text>Không tìm thấy nhóm</Text>
            </View>
        );
    }

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
                        <Text style={styles.infoValue}>{group.description}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="map-outline" size={24} color="#F44336" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Khu vực</Text>
                        <Text style={styles.infoValue}>{group.location}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={24} color="#2196F3" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Thành viên</Text>
                        <Text style={styles.infoValue}>
                            {group.members.toLocaleString()} người
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
                            {new Date(group.createdAt).toLocaleDateString('vi-VN')}
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
                group.posts && group.posts.length > 0 ? (
                    <FlatList
                        data={group.posts}
                        renderItem={({ item }) => <CommunityPostCard post={item} />}
                        keyExtractor={item => item.id}
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
                    <Text style={styles.emptyText}>
                        Tham gia nhóm để xem bài viết
                    </Text>
                </View>
            )}
        </View>
    );

    // --- MỚI: Component render từng thành viên ---
    const renderMemberItem = ({ item, index }) => {
        const isMe = item === user?.uid;
        const isAdminMember = item === group.adminId;

        return (
            <View style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                    <Ionicons name="person" size={20} color="#fff" />
                </View>
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                        {isMe ? "Bạn" : `Thành viên ${index + 1}`}
                    </Text>
                    <Text style={styles.memberRole}>
                        {isAdminMember ? "Quản trị viên" : "Thành viên"}
                    </Text>
                </View>
                {/* Chỉ hiện nút chat nếu không phải là chính mình */}
                {!isMe && (
                    <TouchableOpacity style={styles.messageBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2F847C" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // --- SỬA: Hàm render tab thành viên ---
    const renderMembersTab = () => (
        <View style={styles.tabContent}>
            {group.membersList && group.membersList.length > 0 ? (
                <FlatList
                    data={group.membersList}
                    renderItem={renderMemberItem}
                    keyExtractor={(item, index) => item + index} // Dùng ID hoặc index làm key
                    scrollEnabled={false} // Tắt cuộn riêng để dùng cuộn của màn hình chính
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                        Chưa có thành viên nào
                    </Text>
                </View>
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
                    <Image source={{ uri: group.image }} style={styles.coverImage} />
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
                                        {group.members.toLocaleString()} thành viên
                                    </Text>
                                </View>

                                <View style={styles.metaRow}>
                                    <Ionicons name="location" size={16} color="#fff" style={{ marginTop: 2 }} />
                                    <Text style={styles.groupMetaTextLocation}>
                                        {group.location}
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
        width: 54, // Tăng nhẹ chiều rộng để icon cân đối
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

    // --- MỚI: Styles cho Member Item ---
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