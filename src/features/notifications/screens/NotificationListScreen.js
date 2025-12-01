import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';

const NotificationListScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort client side (mới nhất lên đầu)
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setNotifications(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handlePress = (item) => {
        if (item.data?.screen) {
            if (item.data.params) {
                navigation.navigate(item.data.screen, item.data.params);
            } else {
                navigation.navigate(item.data.screen);
            }
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} - ${date.getDate()}/${date.getMonth()+1}`;
    };

    const renderItem = ({ item }) => {
        let iconName = 'notifications';
        let iconColor = '#555';
        let bgColor = '#fff';

        switch (item.type) {
            case 'campaign': iconName = 'megaphone'; iconColor = '#2F847C'; bgColor = '#E0F2F1'; break;
            case 'trash': iconName = 'trash'; iconColor = '#FF9800'; bgColor = '#FFF3E0'; break;
            case 'weather': iconName = 'warning'; iconColor = '#F44336'; bgColor = '#FFEBEE'; break;
            case 'community': iconName = 'people'; iconColor = '#2196F3'; bgColor = '#E3F2FD'; break;
        }

        return (
            <TouchableOpacity 
                style={[styles.card, !item.isRead && styles.unreadCard]} 
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                    <Ionicons name={iconName} size={24} color={iconColor} />
                </View>
                <View style={styles.contentBox}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                    <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                </View>
                {!item.isRead && <View style={styles.dot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Thông báo" showBackButton={true} />
            <FlatList 
                data={notifications} 
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                        <Text style={{color: '#888', marginTop: 10}}>Chưa có thông báo nào</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    list: { padding: 16 },
    card: {
        flexDirection: 'row', backgroundColor: 'white', padding: 16,
        borderRadius: 16, marginBottom: 12, alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    unreadCard: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#2F847C' },
    iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    contentBox: { flex: 1 },
    title: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#333', marginBottom: 4 },
    body: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#666', lineHeight: 18 },
    time: { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#999', marginTop: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252', marginLeft: 10 },
    empty: { alignItems: 'center', marginTop: 100 }
});

export default NotificationListScreen;