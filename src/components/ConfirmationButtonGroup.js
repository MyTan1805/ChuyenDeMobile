// src/component/ConfirmationButtonGroup.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppButton from './AppButton'; // Import component AppButton đã tạo trước đó

const ConfirmationButtonGroup = ({
    onConfirm,                // Hàm được gọi khi nhấn nút xác nhận
    onCancel,                 // Hàm được gọi khi nhấn nút huỷ
    confirmText = 'Xác Nhận', // Chữ trên nút xác nhận (có thể thay đổi)
    cancelText = 'Huỷ',       // Chữ trên nút huỷ (có thể thay đổi)
    style,                    // Style tùy chỉnh cho cả nhóm nút
}) => {
    return (
        <View style={[styles.container, style]}>
            {/* Nút Huỷ */}
            <View style={styles.buttonWrapper}>
                <AppButton
                    title={cancelText}
                    onPress={onCancel}
                    type="secondary" // Sử dụng type 'secondary' cho nút màu xám
                />
            </View>

            {/* Nút Xác Nhận */}
            <View style={styles.buttonWrapper}>
                <AppButton
                    title={confirmText}
                    onPress={onConfirm}
                    type="primary" // Sử dụng type 'primary' cho nút màu xanh
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // Sắp xếp các nút nằm ngang
        justifyContent: 'space-around', // Căn đều các nút
        width: '100%', // Chiếm toàn bộ chiều rộng của container cha
    },
    buttonWrapper: {
        flex: 1, // Chia đều không gian cho mỗi nút
        marginHorizontal: 8, // Tạo khoảng cách giữa các nút
    },
});

export default ConfirmationButtonGroup;