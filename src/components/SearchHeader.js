import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SearchHeader = ({ onSearchChange, onFilterPress }) => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (onSearchChange) {
            onSearchChange(searchText);
        }
    }, [searchText]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm"
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <TouchableOpacity onPress={onFilterPress}>
                    <Ionicons name="filter-outline" size={26} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#f5f5f5', 
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        height: 40,
        marginHorizontal: 10,
    },
    searchIcon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingLeft: 8,
        fontSize: 16,
        color: 'black',
    },
});

export default SearchHeader;