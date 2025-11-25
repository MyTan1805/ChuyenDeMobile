// src/component/CategorySelector.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CategorySelector = ({
    categories,         // Mảng các chuỗi danh mục, ví dụ: ['Hữu cơ', 'Vô cơ', ...]
    selectedCategory,   // Danh mục hiện tại đang được chọn (do component cha truyền vào)
    onSelectCategory,   // Hàm callback để thông báo cho cha khi một danh mục được chọn
    style,              // Style tùy chỉnh cho container
}) => {
    return (
        <View style={style}>
            <ScrollView
                horizontal={true} // Cho phép cuộn ngang nếu có nhiều mục
                showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn
                contentContainerStyle={styles.container}
            >
                {categories.map((category, index) => {
                    // Kiểm tra xem mục này có phải là mục đang được chọn hay không
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
        backgroundColor: '#56CCF2', // Màu xanh dương như trong thiết kế
    },
    inactiveChip: {
        backgroundColor: '#f0f0f0', // Màu xám nhạt
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