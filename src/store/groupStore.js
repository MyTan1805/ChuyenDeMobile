// src/store/groupStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_GROUPS = [
    {
        id: 'g1',
        name: 'Hội Yêu Rác Tái Chế',
        members: 1243,
        location: 'Quận 1, TP.HCM',
        image: 'https://images.unsplash.com/photo-1596386461350-326e9130e131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        description: 'Cộng đồng những người yêu thích tái chế và sống xanh',
        createdAt: '2024-01-15',
        isPrivate: false,
        adminId: 'user_admin_1',
        membersList: ['user_1', 'user_2', 'user_3'],
        posts: []
    },
    {
        id: 'g2',
        name: 'Sống Xanh Sài Gòn',
        members: 5847,
        location: 'TP.HCM',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        description: 'Kết nối mọi người cùng sống xanh và bảo vệ môi trường',
        createdAt: '2023-12-20',
        isPrivate: false,
        adminId: 'user_admin_2',
        membersList: ['user_4', 'user_5'],
        posts: []
    }
];

export const useGroupStore = create(
    persist(
        (set, get) => ({
            allGroups: MOCK_GROUPS,
            myGroups: [], // Danh sách ID nhóm mà user đã tham gia

            // Lấy danh sách tất cả nhóm
            getAllGroups: () => get().allGroups,

            // Lấy nhóm theo ID
            getGroupById: (groupId) => {
                return get().allGroups.find(g => g.id === groupId);
            },

            // Lấy các nhóm mà user đã tham gia
            getMyGroups: () => {
                const myGroupIds = get().myGroups;
                return get().allGroups.filter(g => myGroupIds.includes(g.id));
            },

            // Tạo nhóm mới
            createGroup: (groupData, userId) => {
                const newGroup = {
                    id: `g_${Date.now()}`,
                    name: groupData.name,
                    location: groupData.location,
                    description: groupData.description || '',
                    image: groupData.image || 'https://via.placeholder.com/500',
                    isPrivate: groupData.isPrivate || false,
                    members: 1,
                    adminId: userId,
                    membersList: [userId],
                    posts: [],
                    createdAt: new Date().toISOString()
                };

                set((state) => ({
                    allGroups: [newGroup, ...state.allGroups],
                    myGroups: [newGroup.id, ...state.myGroups]
                }));

                return { success: true, group: newGroup };
            },

            // Tham gia nhóm
            joinGroup: (groupId, userId) => {
                const group = get().getGroupById(groupId);
                if (!group) return { success: false, error: 'Group not found' };

                // Kiểm tra đã tham gia chưa
                if (get().myGroups.includes(groupId)) {
                    return { success: false, error: 'Already joined' };
                }

                set((state) => ({
                    allGroups: state.allGroups.map(g => {
                        if (g.id === groupId) {
                            return {
                                ...g,
                                members: g.members + 1,
                                membersList: [...g.membersList, userId]
                            };
                        }
                        return g;
                    }),
                    myGroups: [...state.myGroups, groupId]
                }));

                return { success: true };
            },

            // Rời nhóm
            leaveGroup: (groupId, userId) => {
                const group = get().getGroupById(groupId);
                if (!group) return { success: false, error: 'Group not found' };

                // Không cho phép admin rời nhóm
                if (group.adminId === userId) {
                    return { success: false, error: 'Admin cannot leave group' };
                }

                set((state) => ({
                    allGroups: state.allGroups.map(g => {
                        if (g.id === groupId) {
                            return {
                                ...g,
                                members: Math.max(0, g.members - 1),
                                membersList: g.membersList.filter(id => id !== userId)
                            };
                        }
                        return g;
                    }),
                    myGroups: state.myGroups.filter(id => id !== groupId)
                }));

                return { success: true };
            },

            // Thêm bài viết vào nhóm
            addPostToGroup: (groupId, postData) => {
                set((state) => ({
                    allGroups: state.allGroups.map(g => {
                        if (g.id === groupId) {
                            return {
                                ...g,
                                posts: [postData, ...(g.posts || [])]
                            };
                        }
                        return g;
                    })
                }));

                return { success: true };
            },

            // Cập nhật thông tin nhóm
            updateGroup: (groupId, updateData) => {
                set((state) => ({
                    allGroups: state.allGroups.map(g => {
                        if (g.id === groupId) {
                            return { ...g, ...updateData };
                        }
                        return g;
                    })
                }));

                return { success: true };
            },

            // Xóa nhóm (chỉ admin)
            deleteGroup: (groupId, userId) => {
                const group = get().getGroupById(groupId);
                if (!group) return { success: false, error: 'Group not found' };

                if (group.adminId !== userId) {
                    return { success: false, error: 'Only admin can delete group' };
                }

                set((state) => ({
                    allGroups: state.allGroups.filter(g => g.id !== groupId),
                    myGroups: state.myGroups.filter(id => id !== groupId)
                }));

                return { success: true };
            },

            // Kiểm tra user đã tham gia nhóm chưa
            isUserInGroup: (groupId) => {
                return get().myGroups.includes(groupId);
            }
        }),
        {
            name: 'group-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);