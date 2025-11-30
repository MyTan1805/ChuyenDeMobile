import CryptoJS from 'crypto-js';
import { EXPO_PUBLIC_ENCRYPTION_KEY } from '@env'; // Hoặc lấy từ file env của bạn

// Key cứng dự phòng nếu env lỗi (để test)
const DEFAULT_KEY = 'ecomate-secure-key-2025';
const KEY = EXPO_PUBLIC_ENCRYPTION_KEY || DEFAULT_KEY;

export const encrypt = (text) => {
    if (!text) return text;
    try {
        return CryptoJS.AES.encrypt(text, KEY).toString();
    } catch (error) {
        console.log('Encrypt error, keeping original');
        return text;
    }
};

export const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // ✅ QUAN TRỌNG: Nếu giải mã ra chuỗi rỗng (do sai key hoặc format sai), 
        // trả về văn bản gốc (để tương thích dữ liệu cũ chưa mã hóa)
        if (!originalText) return ciphertext;

        return originalText;
    } catch (error) {
        // ✅ QUAN TRỌNG: Bắt lỗi Malformed UTF-8 tại đây và trả về text gốc
        // console.warn('Decryption failed, using original text');
        return ciphertext;
    }
};