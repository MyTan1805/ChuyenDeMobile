import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PostScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Màn hình Đăng tin</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5' // Thêm màu nền để dễ phân biệt
    },
});

export default PostScreen;