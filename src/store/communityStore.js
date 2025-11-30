// src/store/communityStore.js

import { create } from 'zustand';
import { db, auth } from '../config/firebaseConfig';
import {
    collection, addDoc, onSnapshot, query, orderBy, where, arrayRemove,
    doc, updateDoc, increment, arrayUnion, serverTimestamp, deleteDoc, getDoc
} from 'firebase/firestore';
import * as Linking from 'expo-linking';

export const useCommunityStore = create((set, get) => ({
    posts: [],
    loading: false,
    hiddenPosts: [],
    unsubscribePosts: null,

    // ============================================
    // 1. FETCH ALL POSTS (FEED CHUNG)
    // ============================================
    fetchPosts: () => {
        set({ loading: true });
        const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => {
                const data = doc.data();
                let timeStr = 'Vừa xong';
                if (data.createdAt) {
                    const date = data.createdAt.toDate();
                    timeStr = date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return { id: doc.id, ...data, time: timeStr };
            });
            set({ posts: postsData, loading: false });
        });
        set({ unsubscribePosts: unsubscribe });
        return unsubscribe;
    },

    // ============================================
    // 2. FETCH GROUP POSTS (BÀI VIẾT CỦA 1 NHÓM)
    // ============================================
    fetchGroupPosts: (groupId, callback) => {
        const q = query(
            collection(db, "community_posts"),
            where("groupId", "==", groupId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const groupPosts = snapshot.docs.map(doc => {
                const data = doc.data();
                let timeStr = 'Vừa xong';
                if (data.createdAt) {
                    const date = data.createdAt.toDate();
                    timeStr = date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return { id: doc.id, ...data, time: timeStr };
            });
            if (callback) callback(groupPosts);
        });
        return unsubscribe;
    },

    // ============================================
    // 3. ĐĂNG BÀI VIẾT (Hỗ trợ cả Nhóm và Công khai)
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
                likes: [],        // ✅✅✅ LUÔN KHỞI TẠO LÀ MẢNG RỖNG
                comments: [],     // ✅✅✅ LUÔN KHỞI TẠO LÀ MẢNG RỖNG
                groupName: postData.groupName || null,
                groupId: postData.groupId || null,
                location: postData.location || null,
                privacy: postData.privacy || 'public',
                isHidden: false,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "community_posts"), newPost);
            console.log("✅ Đã đăng bài thành công, ID:", docRef.id);
            return { success: true, postId: docRef.id };
        } catch (error) {
            console.error("❌ Lỗi đăng bài:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // TOGGLE LIKE
    // ============================================
    toggleLikePost: async (postId, userId) => {
        try {
            const postRef = doc(db, "community_posts", postId);
            const postDoc = await getDoc(postRef);

            if (!postDoc.exists()) {
                console.error('Post not found');
                return;
            }

            const currentLikes = postDoc.data().likes || [];

            if (currentLikes.includes(userId)) {
                // Unlike - xóa userId
                await updateDoc(postRef, {
                    likes: arrayRemove(userId)
                });
                console.log("💔 Đã unlike bài viết:", postId);
            } else {
                // Like - thêm userId
                await updateDoc(postRef, {
                    likes: arrayUnion(userId)
                });
                console.log("❤️ Đã like bài viết:", postId);
            }

            // Cập nhật lại state local
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

    // ============================================
    // ADD COMMENT
    // ============================================
    addCommentToPost: async (postId, commentData) => {
        try {
            const postRef = doc(db, "community_posts", postId);

            // 1. Chỉ cần gửi lên Firebase
            await updateDoc(postRef, { comments: arrayUnion(commentData) });

            // ❌ BỎ PHẦN DƯỚI ĐÂY ĐỂ TRÁNH LẶP
            // Vì onSnapshot ở fetchPosts sẽ tự động nhận dữ liệu mới từ server về và cập nhật UI.
            /* 
            set(state => ({
                posts: state.posts.map(p => {
                    if (p.id === postId) {
                        return { ...p, comments: [...(p.comments || []), commentData] };
                    }
                    return p;
                })
            }));
            */

            console.log("✅ Đã thêm comment vào bài:", postId);
        } catch (error) {
            console.error("❌ Lỗi comment:", error);
            throw error; // Ném lỗi ra để màn hình bên ngoài biết mà xử lý (alert)
        }
    },

    // ============================================
    // HIDE POST (User khác)
    // ============================================
    hidePost: (postId) => {
        set(state => ({
            hiddenPosts: [...state.hiddenPosts, postId]
        }));
        console.log("🙈 Đã ẩn bài viết:", postId);
    },

    // ============================================
    // DELETE POST (✅ LOGIC HOÀN CHỈNH)
    // ============================================
    deletePost: async (postId) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("❌ Chưa đăng nhập");
                return { success: false, error: "Chưa đăng nhập" };
            }

            // 1. Lấy thông tin bài viết từ local state
            const post = get().posts.find(p => p.id === postId);

            if (!post) {
                console.error("❌ Không tìm thấy bài viết trong state");
                return { success: false, error: "Bài viết không tồn tại" };
            }

            console.log("🗑️ Bắt đầu xóa bài viết:", postId);
            console.log("📝 Thông tin bài viết:", {
                userId: post.userId,
                currentUserId: currentUser.uid,
                groupId: post.groupId,
                groupName: post.groupName
            });

            // 2. Kiểm tra quyền (tùy chọn - Firebase Rules sẽ kiểm tra chính xác)
            const isOwner = post.userId === currentUser.uid;
            const isInGroup = post.groupId != null;

            console.log("🔐 Kiểm tra quyền:", {
                isOwner,
                isInGroup,
                message: isOwner
                    ? "Chủ bài viết"
                    : isInGroup
                        ? "Admin nhóm (sẽ được Rules kiểm tra)"
                        : "Không có quyền"
            });

            // 3. Xóa trên Firestore (Rules sẽ kiểm tra quyền)
            console.log("🔥 Đang xóa trên Firestore...");
            await deleteDoc(doc(db, "community_posts", postId));
            console.log("✅ Đã xóa thành công trên Firestore");

            // 4. Xóa khỏi local state của Community
            set(state => ({
                posts: state.posts.filter(p => p.id !== postId)
            }));
            console.log("✅ Đã xóa khỏi Community local state");

            // 5. Đồng bộ xóa khỏi Group Store (nếu bài viết thuộc nhóm)
            if (post.groupId) {
                console.log("🔄 Đồng bộ xóa khỏi Group Store:", post.groupName);

                // Import động để tránh circular dependency
                const { useGroupStore } = require('./groupStore');

                // Gọi action xóa bài viết khỏi nhóm
                useGroupStore.getState().removePostFromGroup(postId);
                console.log("✅ Đã đồng bộ xóa khỏi Group Store");
            }

            console.log("🎉 Hoàn tất xóa bài viết:", postId);
            return { success: true };

        } catch (error) {
            console.error("❌ Lỗi xóa bài:", error);
            console.error("❌ Chi tiết lỗi:", {
                code: error.code,
                message: error.message,
                name: error.name
            });

            // Xử lý lỗi cụ thể
            let userMessage = "Không thể xóa bài viết";

            if (error.code === 'permission-denied') {
                userMessage = "Bạn không có quyền xóa bài viết này";
            } else if (error.code === 'not-found') {
                userMessage = "Bài viết không tồn tại";
            } else if (error.code === 'unavailable') {
                userMessage = "Không thể kết nối đến server. Vui lòng thử lại";
            }

            return { success: false, error: userMessage };
        }
    },

    // ============================================
    // [NEW] UPDATE POST
    // ============================================
    updatePost: async (postId, updateData) => {
        try {
            const postRef = doc(db, "community_posts", postId);

            // Chỉ cập nhật các trường thay đổi
            await updateDoc(postRef, {
                ...updateData,
                isEdited: true, // Đánh dấu đã chỉnh sửa
                updatedAt: serverTimestamp()
            });

            console.log("✅ Đã cập nhật bài viết:", postId);
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi cập nhật bài viết:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // GET VISIBLE POSTS (Lọc bài ẩn)
    // ============================================
    getVisiblePosts: () => {
        const { posts, hiddenPosts } = get();
        return posts.filter(p => !hiddenPosts.includes(p.id));
    },

    // ============================================
    // GENERATE SHARE LINK
    // ============================================
    generateShareLink: (postId) => {
        return Linking.createURL(`post/${postId}`);
    },

    // ============================================
    // GET POST BY ID
    // ============================================
    getPostById: (id) => get().posts.find(p => p.id === id),
}));