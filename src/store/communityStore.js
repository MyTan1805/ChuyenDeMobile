// src/store/communityStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const INITIAL_POSTS = [
    {
        id: '1',
        userName: 'Minh Thư',
        userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        time: '2 giờ trước',
        groupName: 'Cộng đồng Xanh Hà Nội',
        content: 'Hôm nay mình đã tái chế được 5 chai nhựa thành chậu cây xinh xắn này! Mọi người thấy sao? 🌱 #TaiChe #SongXanh',
        // Dữ liệu cũ (string), vẫn hỗ trợ tương thích ngược
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
        likes: 24,
        isLiked: false,
        comments: [],
        userId: 'user_1',
        isHidden: false
    },
    {
        id: '2',
        userName: 'Tuấn Anh',
        userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        time: '5 giờ trước',
        content: 'Mẹo nhỏ: Hãy dùng nước vo gạo để tưới cây, vừa tiết kiệm nước vừa tốt cho cây cối nhé cả nhà.',
        likes: 45,
        isLiked: false,
        comments: [],
        userId: 'user_2',
        isHidden: false
    }
];

export const useCommunityStore = create(
    persist(
        (set, get) => ({
            posts: INITIAL_POSTS,

            // 1. Thêm bài viết mới
            // CẬP NHẬT: Lưu mảng images để hiển thị nhiều ảnh
            addNewPost: (postData) => set((state) => ({
                posts: [{
                    ...postData,
                    isHidden: false,
                    comments: [],
                    images: postData.images || []
                }, ...state.posts]
            })),

            // 2. Toggle Like
            toggleLike: (postId) => set((state) => ({
                posts: state.posts.map(post => {
                    if (post.id === postId) {
                        const newIsLiked = !post.isLiked;
                        return {
                            ...post,
                            isLiked: newIsLiked,
                            likes: newIsLiked ? post.likes + 1 : post.likes - 1
                        };
                    }
                    return post;
                })
            })),

            // 3. Thêm comment vào bài viết
            addCommentToPost: (postId, commentData) => set((state) => ({
                posts: state.posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: [commentData, ...(post.comments || [])]
                        };
                    }
                    return post;
                })
            })),

            // 4. Xóa bài viết vĩnh viễn
            deletePost: (postId) => set((state) => ({
                posts: state.posts.filter(p => p.id !== postId)
            })),

            // 5. Ẩn bài viết
            hidePost: (postId) => set((state) => ({
                posts: state.posts.map(post =>
                    post.id === postId ? { ...post, isHidden: true } : post
                )
            })),

            // Helper: Lấy danh sách bài viết hiển thị (lọc bỏ bài ẩn)
            getVisiblePosts: () => {
                return get().posts.filter(p => !p.isHidden);
            },

            // 6. Tạo Link chia sẻ
            generateShareLink: (postId) => {
                return Linking.createURL(`post/${postId}`);
            },

            // Helper lấy bài viết theo ID
            getPostById: (id) => get().posts.find(p => p.id === id)
        }),
        {
            name: 'community-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);