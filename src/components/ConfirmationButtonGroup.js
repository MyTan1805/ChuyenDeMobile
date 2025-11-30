import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppButton from './AppButton'; 

const ConfirmationButtonGroup = ({
    onConfirm,  
    onCancel,  
    confirmText = 'Xác Nhận', 
    cancelText = 'Huỷ', 
    style,  
}) => {
    return (
        <View style={[styles.container, style]}>
            {/* Nút Huỷ */}
            <View style={styles.buttonWrapper}>
                <AppButton
                    title={cancelText}
                    onPress={onCancel}
                    type="secondary" 
                />
            </View>

            {/* Nút Xác Nhận */}
            <View style={styles.buttonWrapper}>
                <AppButton
                    title={confirmText}
                    onPress={onConfirm}
                    type="primary"  
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',  
        justifyContent: 'space-around',  
        width: '100%',  
    },
    buttonWrapper: {
        flex: 1,  
        marginHorizontal: 8, 
    },
});

export default ConfirmationButtonGroup;