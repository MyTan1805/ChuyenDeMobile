// src/store/communityStore.js

import { create } from 'zustand';
import { db, auth } from '../config/firebaseConfig';
import {
    collection, addDoc, onSnapshot, query, orderBy, where,
    doc, updateDoc, increment, arrayUnion, arrayRemove,
    serverTimestamp, deleteDoc, getDoc
} from 'firebase/firestore';

export const useCommunityStore = create((set, get) => ({
    posts: [],
    loading: false,
    hiddenPosts: [],
    unsubscribePosts: null,

    // ============================================
    // ⭐ FETCH ALL POSTS - FIXED WITH ERROR HANDLING
    // ============================================
    fetchPosts: () => {
        set({ loading: true });

        // ✅ SỬA QUERY: Thêm điều kiện where("privacy", "==", "public")
        // Điều này khớp với Rule cho phép đọc bài public.
        const q = query(
            collection(db, "community_posts"),
            where("isHidden", "==", false),
            where("privacy", "==", "public"), // <--- THÊM DÒNG NÀY
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => {
                const data = doc.data();
                let timeStr = 'Vừa xong';
                if (data.createdAt) {
                    const date = data.createdAt.toDate();
                    timeStr = date.toLocaleDateString('vi-VN') + ' ' +
                        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return { id: doc.id, ...data, time: timeStr };
            });

            // Không cần filter client-side nữa vì query đã lọc rồi
            set({ posts: postsData, loading: false });
        },
            (error) => {
                console.error("❌ Fetch Posts Error:", error.message);
                // Không set posts về rỗng để tránh mất dữ liệu cũ nếu lỗi mạng thoáng qua
                set({ loading: false });
            }
        );

        set({ unsubscribePosts: unsubscribe });
        return unsubscribe;
    },

    // ============================================
    // ⭐ FETCH GROUP POSTS - FIXED
    // ============================================
    fetchGroupPosts: (groupId, callback) => {
        let realUnsubscribe = null;
        let isUnmounted = false;

        const init = async () => {
            try {
                // 1. Lấy thông tin Group để check quyền
                const groupRef = doc(db, "groups", groupId);
                const groupSnap = await getDoc(groupRef);

                if (isUnmounted) return;
                if (!groupSnap.exists()) {
                    if (callback) callback([]);
                    return;
                }

                const groupData = groupSnap.data();
                const currentUser = auth.currentUser;
                const membersList = groupData.membersList || [];

                // Kiểm tra user có phải là thành viên không
                const isMember = currentUser && membersList.includes(currentUser.uid);

                // Nếu nhóm Riêng tư và không phải thành viên -> Chặn
                if (groupData.isPrivate && !isMember) {
                    if (callback) callback([]);
                    return;
                }

                // 2. Xây dựng Query an toàn với Rules
                // Base constraints
                const constraints = [
                    where("groupId", "==", groupId),
                    where("isHidden", "==", false),
                    orderBy("createdAt", "desc")
                ];

                // 🔥 QUAN TRỌNG: Nếu KHÔNG phải thành viên, chỉ được phép query bài Public
                // Điều này giúp Query khớp hoàn toàn với Rule
                if (!isMember) {
                    constraints.push(where("privacy", "==", "public"));
                }

                const q = query(collection(db, "community_posts"), ...constraints);

                // 3. Subscribe
                realUnsubscribe = onSnapshot(q, (snapshot) => {
                    const groupPosts = snapshot.docs.map(doc => {
                        const data = doc.data();
                        let timeStr = 'Vừa xong';
                        if (data.createdAt) {
                            const date = data.createdAt.toDate();
                            timeStr = date.toLocaleDateString('vi-VN') + ' ' +
                                date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                        return { id: doc.id, ...data, time: timeStr };
                    });
                    if (callback) callback(groupPosts);
                },
                    (error) => {
                        console.error("❌ Error fetching group posts:", error.message);
                        // Xử lý lỗi index nếu cần
                        if (error.code === 'failed-precondition') {
                            console.log("⚠️ Cần tạo Index trên Firebase Console cho query này.");
                        }
                        if (callback) callback([]);
                    }
                );

            } catch (error) {
                console.error("❌ Init Group Posts Error:", error);
                if (callback) callback([]);
            }
        };

        init();

        return () => {
            isUnmounted = true;
            if (realUnsubscribe) realUnsubscribe();
        };
    },

    // ============================================
    // CÁC HÀM KHÁC (GIỮ NGUYÊN)
    // ============================================
    addNewPost: async (postData) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return { success: false, error: "User chưa đăng nhập" };

            const newPost = {
                userId: currentUser.uid,
                userName: postData.userName,
                userAvatar: postData.userAvatar || null,
                content: postData.content || "",
                images: postData.images || [],
                likes: [],
                comments: [],
                groupName: postData.groupName || null,
                groupId: postData.groupId || null,
                location: postData.location || null,
                privacy: postData.privacy || 'public',
                isHidden: false,
                reportCount: 0,
                reports: [],
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "community_posts"), newPost);
            console.log("✅ Đã đăng bài:", docRef.id);
            return { success: true, postId: docRef.id };
        } catch (error) {
            console.error("❌ Lỗi đăng bài:", error);
            return { success: false, error: error.message };
        }
    },

    reportPost: async (postId, reason, reporterId) => {
        try {
            const postRef = doc(db, "community_posts", postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                return { success: false, error: "Bài viết không tồn tại" };
            }

            const currentReports = postDoc.data().reports || [];
            const alreadyReported = currentReports.some(r => r.reporterId === reporterId);

            if (alreadyReported) {
                return { success: false, error: "Bạn đã báo cáo bài viết này rồi" };
            }

            const newReport = {
                reporterId: reporterId,
                reason: reason,
                timestamp: new Date().toISOString()
            };

            await updateDoc(postRef, {
                reports: arrayUnion(newReport),
                reportCount: increment(1)
            });

            const updatedDoc = await getDoc(postRef);
            const reportCount = updatedDoc.data().reportCount || 0;

            if (reportCount >= 5) {
                await updateDoc(postRef, {
                    isHidden: true,
                    hiddenReason: "Vi phạm chính sách (quá nhiều báo cáo)"
                });
            }

            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi báo cáo:", error);
            return { success: false, error: error.message };
        }
    },

    toggleLikePost: async (postId, userId) => {
        try {
            const postRef = doc(db, "community_posts", postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) return;

            const currentLikes = postDoc.data().likes || [];

            if (currentLikes.includes(userId)) {
                await updateDoc(postRef, { likes: arrayRemove(userId) });
            } else {
                await updateDoc(postRef, { likes: arrayUnion(userId) });
            }

            // Update local state
            set(state => ({
                posts: state.posts.map(p => {
                    if (p.id === postId) {
                        const newLikes = currentLikes.includes(userId)
                            ? currentLikes.filter(id => id !== userId)
                            : [...currentLikes, userId];
                        return { ...p, likes: newLikes };
                    }
                    return p;
                })
            }));
        } catch (error) {
            console.error("❌ Lỗi toggle like:", error);
        }
    },

    addCommentToPost: async (postId, commentData) => {
        try {
            const postRef = doc(db, "community_posts", postId);
            await updateDoc(postRef, { comments: arrayUnion(commentData) });
        } catch (error) {
            console.error("❌ Lỗi comment:", error);
            throw error;
        }
    },

    hidePost: (postId) => {
        set(state => ({ hiddenPosts: [...state.hiddenPosts, postId] }));
    },

    deletePost: async (postId) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return { success: false, error: "Chưa đăng nhập" };

            const post = get().posts.find(p => p.id === postId);
            if (!post) return { success: false, error: "Bài viết không tồn tại" };

            await deleteDoc(doc(db, "community_posts", postId));

            set(state => ({ posts: state.posts.filter(p => p.id !== postId) }));

            if (post.groupId) {
                const { useGroupStore } = require('./groupStore');
                useGroupStore.getState().removePostFromGroup(postId);
            }

            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi xóa bài:", error);
            return { success: false, error: error.message };
        }
    },

    updatePost: async (postId, updateData) => {
        try {
            const postRef = doc(db, "community_posts", postId);
            await updateDoc(postRef, {
                ...updateData,
                isEdited: true,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi cập nhật:", error);
            return { success: false, error: error.message };
        }
    },

    getVisiblePosts: () => {
        const { posts, hiddenPosts } = get();
        return posts.filter(p => !hiddenPosts.includes(p.id) && !p.isHidden);
    },

    getPostById: (id) => get().posts.find(p => p.id === id),
}));