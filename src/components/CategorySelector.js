import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CategorySelector = ({
    categories, 
    selectedCategory,  
    onSelectCategory, 
    style,      
}) => {
    return (
        <View style={style}>
            <ScrollView
                horizontal={true} 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.container}
            >
                {categories.map((category, index) => {
                    const isActive = category === selectedCategory;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.chip,
                                isActive ? styles.activeChip : styles.inactiveChip
                            ]}
                            onPress={() => onSelectCategory(category)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.chipText,
                                isActive ? styles.activeChipText : styles.inactiveChipText
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeChip: {
        backgroundColor: '#56CCF2',  
    },
    inactiveChip: {
        backgroundColor: '#f0f0f0',  
    },
    chipText: {
        fontSize: 14,
        fontFamily: 'Nunito-Bold',
    },
    activeChipText: {
        color: 'white',
    },
    inactiveChipText: {
        color: '#333',
    },
});

export default CategorySelector;