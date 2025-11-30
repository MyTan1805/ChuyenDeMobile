import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText, placeholder = "Tìm kiếm...", style }) => {
    const handleClear = () => {
        onChangeText('');
    };

    return (
        <View style={[styles.container, style]}>
            <Ionicons name="search-outline" size={22} color="#888" style={styles.icon} />

            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChangeText}
            />

            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                    <Ionicons name="close-circle" size={22} color="#888" style={styles.icon} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f1f5', 
        borderRadius: 12,
        height: 45,
        paddingHorizontal: 12,
    },
    icon: {
        marginHorizontal: 5,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333',
    },
});

export default SearchBar;