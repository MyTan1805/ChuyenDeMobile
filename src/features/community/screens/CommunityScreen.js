import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CommunityScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Màn hình Cộng đồng</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CommunityScreen;