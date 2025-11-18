// src/component/AppButton.js

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const AppButton = ({
    title,
    onPress,
    type = 'primary',
    style,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[type],
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Text style={[styles.text, styles[`${type}Text`]]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: '#8BC34A',
    },
    secondary: {
        backgroundColor: '#e0e0e0',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: '#333',
    },
});

export default AppButton;