// src/store/userStore.js
import { create } from 'zustand';
import { auth } from '../config/firebaseConfig';
import { 
  onAuthStateChanged, // <-- Import hàm lắng nghe
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

export const useUserStore = create((set) => ({
  user: null,
  isLoading: true, // Bắt đầu với trạng thái đang tải

  /**
   * Hàm này sẽ được gọi một lần duy nhất khi app khởi động.
   * Nó sẽ lắng nghe mọi thay đổi về trạng thái đăng nhập.
   */
  checkAuthState: () => {
    // onAuthStateChanged sẽ trả về một hàm "unsubscribe"
    // để chúng ta có thể ngừng lắng nghe khi cần.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Khi có thay đổi (đăng nhập, đăng xuất), cập nhật lại store.
      set({ user: user, isLoading: false });
    });
    return unsubscribe; // Trả về hàm để có thể gọi sau này
  },

  // Hàm đăng nhập (không cần thay đổi, nhưng cần xử lý kết quả)
  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Không cần set({ user }) ở đây nữa vì onAuthStateChanged sẽ tự làm
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  },

  // Hàm đăng xuất
  logout: async () => {
    await signOut(auth);
    // Không cần set({ user: null }) ở đây nữa vì onAuthStateChanged sẽ tự làm
  },
  
  // ... các hàm khác
}));