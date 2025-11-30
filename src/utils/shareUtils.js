// src/utils/shareUtils.js

import { Share, Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';

/**
 * Hàm chia sẻ nội dung chung cho toàn App
 * @param {string} title - Tiêu đề chia sẻ
 * @param {string} message - Nội dung mô tả ngắn
 * @param {string} path - Đường dẫn màn hình (ví dụ: 'post/123')
 */
export const shareContent = async ({ title, message, path }) => {
    try {
        // 1. Tạo Deep Link
        // - Trong Expo Go: exp://.../--/post/123
        // - Trong App Build: ecomate://post/123
        const deepLink = Linking.createURL(path);

        console.log("🔗 Link được tạo:", deepLink);

        // 2. Chuẩn bị nội dung tin nhắn
        // Android cần nối link vào message để các app nhắn tin (Zalo, Mess) hiển thị preview
        const shareMessage = Platform.OS === 'android'
            ? `${message}\n\nXem chi tiết tại:\n${deepLink}`
            : message;

        // 3. Gọi Share API
        const result = await Share.share({
            title: title || 'Chia sẻ từ EcoMate',
            message: shareMessage,
            url: deepLink, // iOS dùng tham số này
        });

        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                console.log('Shared via', result.activityType);
            } else {
                console.log('Shared successfully');
            }
        } else if (result.action === Share.dismissedAction) {
            console.log('Share dismissed');
        }
    } catch (error) {
        Alert.alert("Lỗi", "Không thể chia sẻ nội dung này.");
        console.error(error.message);
    }
};