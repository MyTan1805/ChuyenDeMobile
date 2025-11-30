// src/utils/encryption.js
import CryptoJS from 'crypto-js';

// ⚠️ LƯU Ý: Trong thực tế, nên để key này trong file .env (EXPO_PUBLIC_ENCRYPTION_KEY)
// Đây là key dùng để khóa/mở khóa dữ liệu. Nếu mất key này, dữ liệu sẽ không thể phục hồi.
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'ecomate-secure-key-2025';

export const encrypt = (text) => {
    if (!text) return text;
    try {
        return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // Fallback về text gốc nếu lỗi
    }
};

export const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || ciphertext; // Nếu giải mã ra rỗng (do sai key/lỗi), trả về text gốc
    } catch (error) {
        console.error('Decryption error:', error);
        return ciphertext;
    }
};