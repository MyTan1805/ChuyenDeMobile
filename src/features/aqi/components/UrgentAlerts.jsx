import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig'; // Import db

const UrgentAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Lấy 2 chiến dịch mới nhất đang hoạt động
        const q = query(
            collection(db, "campaigns"),
            where("isActive", "==", true),
            orderBy("createdAt", "desc"),
            limit(2)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAlerts(data);
        });

        return () => unsubscribe();
    }, []);

    if (alerts.length === 0) return null; // Ẩn nếu không có tin

    return (
        <View style={styles.container}>
            {alerts.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={[
                        styles.alertItem, 
                        // Chiến dịch quan trọng thì màu đỏ, thường thì màu xanh
                        item.isUrgent ? styles.warningBg : styles.infoBg
                    ]}
                >
                    <Ionicons 
                        name={item.isUrgent ? "warning" : "megaphone"} 
                        size={24} 
                        color={item.isUrgent ? "#D32F2F" : "#2E7D32"} 
                        style={styles.icon}
                    />
                    <View style={{flex: 1}}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.alertText} numberOfLines={2}>{item.description}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 10 },
    alertItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    warningBg: { backgroundColor: '#FFEBEE' },
    infoBg: { backgroundColor: '#E8F5E9' },
    icon: { marginRight: 12 },
    title: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#333', marginBottom: 2 },
    alertText: { fontSize: 13, color: '#555', fontFamily: 'Nunito-Regular', lineHeight: 18 },
});

export default UrgentAlerts;