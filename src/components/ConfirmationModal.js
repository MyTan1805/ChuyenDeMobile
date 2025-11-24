// src/component/ConfirmationModal.js

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Đảm bảo bạn đã cài @expo/vector-icons

const ConfirmationModal = ({
    visible,                // Prop để điều khiển ẩn/hiện modal (true/false)
    title,                  // Tiêu đề của thông báo
    message,                // Nội dung chi tiết của thông báo
    onConfirm,              // Hàm sẽ được gọi khi nhấn "Xác Nhận"
    onCancel,               // Hàm sẽ được gọi khi nhấn "Huỷ"
    confirmText = 'Xác Nhận', // Chữ trên nút xác nhận, có thể tuỳ chỉnh
    cancelText = 'Huỷ',     // Chữ trên nút huỷ, có thể tuỳ chỉnh
}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel} // Cho phép nút back của Android đóng modal
        >
            {/* Lớp phủ mờ */}
            <View style={styles.overlay}>
                {/* Khung chứa nội dung */}
                <View style={styles.modalContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert-outline" size={32} color="#f44336" />
                    </View>

                    {/* Tiêu đề */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Nội dung (nếu có) */}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Khu vực chứa các nút */}
                    <View style={styles.buttonsContainer}>
                        {/* Nút Huỷ */}
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.buttonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        {/* Nút Xác Nhận */}
                        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={[styles.buttonText, styles.confirmButtonText]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền đen mờ 50%
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#feebee', // Màu nền đỏ nhạt
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between', // Đẩy 2 nút ra 2 bên
    },
    button: {
        flex: 1, // Chia đều không gian cho 2 nút
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5, // Tạo khoảng cách giữa 2 nút
    },
    cancelButton: {
        backgroundColor: '#e0e0e0', // Màu xám nhạt
    },
    confirmButton: {
        backgroundColor: '#8BC34A', // Màu xanh lá cây
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#333',
    },
    confirmButtonText: {
        color: 'white',
    },
});

export default ConfirmationModal;