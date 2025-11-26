// src/component/CustomCheckbox.js

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icon

const CustomCheckbox = ({
    isChecked,
    onValueChange,
    size = 28,
    style,
}) => {
    return (
        <TouchableOpacity
            style={style}
            onPress={() => onValueChange(!isChecked)}
            activeOpacity={0.8}
        >
            <View 
                style={[
                    styles.box, 
                    { 
                        width: size, 
                        height: size, 
                        borderWidth: 2,
                        // Áp dụng style dựa trên isChecked
                        backgroundColor: isChecked ? '#009688' : '#FFFFFF',
                        borderColor: isChecked ? '#009688' : '#BDBDBD',
                    }
                ]}
            >
                {/* Chỉ hiển thị icon khi isChecked là true */}
                {isChecked && (
                    <Ionicons name="checkmark" size={size * 0.7} color="white" />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    box: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CustomCheckbox;