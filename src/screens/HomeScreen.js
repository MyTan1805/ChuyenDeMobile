import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomHeader from '../component/CustomHeader'; // Import header

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader
                useLogo={true}
                showMenuButton={true}
                showNotificationButton={true}
                onMenuPress={() => alert('Menu pressed!')}
                onNotificationPress={() => alert('Notification pressed!')}
            />
            <View style={styles.content}>
                <Text>Nội dung trang chủ ở đây</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default HomeScreen;