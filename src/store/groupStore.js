// src/store/groupStore.js

import { create } from 'zustand';
import { db, auth } from '../config/firebaseConfig';
import {
    collection, addDoc, updateDoc, doc,
    arrayUnion, arrayRemove, increment,
    onSnapshot, query, orderBy, where, serverTimestamp, deleteDoc
} from 'firebase/firestore';

export const useGroupStore = create((set, get) => ({
    allGroups: [],
    myGroups: [],
    loading: false,
    unsubscribeGroups: null,

    // ============================================
    // 1. LẮNG NGHE DỮ LIỆU REALTIME TỪ FIREBASE
    // ============================================
    fetchGroups: () => {
        set({ loading: true });

        // Query sắp xếp theo ngày tạo mới nhất
        const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const user = auth.currentUser;
            const groupsData = [];
            const myGroupIds = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                const groupItem = { id: doc.id, ...data };
                groupsData.push(groupItem);

                // Logic xác định nhóm "Của tôi"
                if (user && data.membersList && data.membersList.includes(user.uid)) {
                    myGroupIds.push(doc.id);
                }
            });

            // CẬP NHẬT STATE: Bất kỳ thay đổi nào trên DB sẽ trigger cập nhật lại allGroups
            set({
                allGroups: groupsData,
                myGroups: myGroupIds,
                loading: false
            });
        }, (error) => {
            console.error("❌ Lỗi tải danh sách nhóm:", error);
            set({ loading: false });
        });

        set({ unsubscribeGroups: unsubscribe });
        return unsubscribe;
    },

    // ============================================
    // 2. TẠO NHÓM MỚI (LƯU VÀO FIRESTORE)
    // ============================================
    createGroup: async (groupData, userId) => {
        try {
            const newGroup = {
                name: groupData.name,
                location: groupData.location,
                city: groupData.city || '',
                district: groupData.district || '',
                ward: groupData.ward || '',
                description: groupData.description || '',
                image: groupData.image || 'https://via.placeholder.com/500',
                isPrivate: groupData.isPrivate || false,
                members: 1,
                adminId: userId,
                membersList: [userId], // Người tạo tự động là thành viên
                posts: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "groups"), newGroup);
            console.log("✅ Group created in Firebase:", docRef.id);
            return { success: true, groupId: docRef.id };
        } catch (error) {
            console.error("❌ Error creating group:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // 3. THAM GIA NHÓM
    // ============================================
    joinGroup: async (groupId, userId) => {
        try {
            const groupRef = doc(db, "groups", groupId);

            await updateDoc(groupRef, {
                membersList: arrayUnion(userId), // Thêm UID vào mảng
                members: increment(1)            // Tăng số lượng lên 1
            });

            console.log("✅ Đã tham gia nhóm:", groupId);
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi tham gia nhóm:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // 4. RỜI NHÓM
    // ============================================
    leaveGroup: async (groupId, userId) => {
        try {
            const group = get().getGroupById(groupId);

            // Không cho Admin rời nhóm (logic nghiệp vụ)
            if (group && group.adminId === userId) {
                return { success: false, error: 'Quản trị viên không thể rời nhóm. Hãy chuyển quyền hoặc xóa nhóm.' };
            }

            const groupRef = doc(db, "groups", groupId);

            await updateDoc(groupRef, {
                membersList: arrayRemove(userId), // Xóa UID khỏi mảng
                members: increment(-1)            // Giảm số lượng đi 1
            });

            console.log("✅ Đã rời nhóm:", groupId);
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi rời nhóm:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // 5. CẬP NHẬT THÔNG TIN NHÓM (CHO ADMIN)
    // ============================================
    updateGroup: async (groupId, updateData) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            console.log("✅ Đã cập nhật nhóm:", groupId);
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi cập nhật nhóm:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // 6. XÓA NHÓM (CHO ADMIN)
    // ============================================
    deleteGroup: async (groupId, userId) => {
        try {
            const group = get().getGroupById(groupId);

            // Kiểm tra quyền admin (Firestore Rules cũng sẽ check lại)
            if (group && group.adminId !== userId) {
                return { success: false, error: 'Bạn không có quyền xóa nhóm này.' };
            }

            await deleteDoc(doc(db, "groups", groupId));
            console.log("✅ Đã xóa nhóm:", groupId);
            return { success: true };
        } catch (error) {
            console.error("❌ Lỗi xóa nhóm:", error);
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // [NEW] 7. THÊM BÀI VIẾT VÀO NHÓM
    // ============================================
    addPostToGroup: async (groupId, postData) => {
        try {
            // Cập nhật Firestore: Thêm ID bài viết vào mảng posts của nhóm
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                posts: arrayUnion(postData.id)
            });

            // Cập nhật Local State (Optimistic UI)
            const allGroups = get().allGroups.map(g => {
                if (g.id === groupId) {
                    const currentPosts = g.posts || [];
                    return { ...g, posts: [...currentPosts, postData.id] };
                }
                return g;
            });
            set({ allGroups });

            console.log("✅ Đã link bài viết vào nhóm:", groupId);
        } catch (error) {
            console.error("❌ Lỗi addPostToGroup:", error);
        }
    },

    // ============================================
    // [NEW] 8. XÓA BÀI VIẾT KHỎI NHÓM
    // ============================================
    removePostFromGroup: async (postId) => {
        try {
            // Tìm nhóm chứa bài viết này trong state
            const groupWithPost = get().allGroups.find(g => g.posts && g.posts.includes(postId));

            if (groupWithPost) {
                const groupRef = doc(db, "groups", groupWithPost.id);
                await updateDoc(groupRef, {
                    posts: arrayRemove(postId)
                });

                // Cập nhật Local State
                const allGroups = get().allGroups.map(g => {
                    if (g.id === groupWithPost.id) {
                        return { ...g, posts: (g.posts || []).filter(id => id !== postId) };
                    }
                    return g;
                });
                set({ allGroups });
                console.log("✅ Đã gỡ bài viết khỏi nhóm:", groupWithPost.id);
            }
        } catch (error) {
            console.error("❌ Lỗi removePostFromGroup:", error);
        }
    },

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    getAllGroups: () => get().allGroups,

    getGroupById: (groupId) => {
        return get().allGroups.find(g => g.id === groupId);
    },

    getMyGroups: () => {
        const myGroupIds = get().myGroups;
        return get().allGroups.filter(g => myGroupIds.includes(g.id));
    },

    isUserInGroup: (groupId) => {
        return get().myGroups.includes(groupId);
    }
}));