import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const ConfirmationModal = ({
    visible,         
    title,    
    message,        
    onConfirm,   
    onCancel,     
    confirmText = 'Xác Nhận', 
    cancelText = 'Huỷ',   
}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}  
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert-outline" size={32} color="#f44336" />
                    </View>

                    <Text style={styles.title}>{title}</Text>

                    {message && <Text style={styles.message}>{message}</Text>}

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.buttonText}>{cancelText}</Text>
                        </TouchableOpacity>

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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        backgroundColor: '#feebee', 
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
        justifyContent: 'space-between', 
    },
    button: {
        flex: 1, 
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5, 
    },
    cancelButton: {
        backgroundColor: '#e0e0e0', 
    },
    confirmButton: {
        backgroundColor: '#8BC34A',  
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