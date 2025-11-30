import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({
    iconName,  
    placeholder,    
    value,     
    onChangeText,   
    secureTextEntry = false, 
    style,        
    ...rest  
}) => {
    return (
        <View style={[styles.container, style]}>
            <Ionicons name={iconName} size={22} color="#888" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                {...rest} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 55,
        backgroundColor: '#f0f1f5', 
        borderRadius: 30,  
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1, 
        height: '100%',
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        color: '#333',
    },
});

export default CustomInput;