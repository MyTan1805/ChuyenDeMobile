// src/screens/ProfileScreen.js

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CustomHeader from '../component/CustomHeader';

// Import component BadgeProgressCard
import BadgeProgressCard from '../component/BadgeProgressCard';

const ProfileScreen = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <CustomHeader title="Progress Card Tĩnh" />

            <ScrollView contentContainerStyle={styles.container}>
                
                {/* VÍ DỤ 1: HIỂN THỊ 75% */}
    
                <BadgeProgressCard
                    title="Quá trình huy hiệu tiếp theo"
                    label="Chiến binh môi trường"
                    currentValue={75} // <-- CHÚNG TA TRUYỀN SỐ 75 VÀO ĐÂY
                    maxValue={100}
                    unit="điểm"
                    style={{ marginBottom: 30 }}
                />


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default ProfileScreen;