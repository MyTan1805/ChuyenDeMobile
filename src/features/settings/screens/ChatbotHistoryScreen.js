import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ChatbotHistoryScreen = () => {
    const { userProfile, deleteChatSession } = useUserStore(); // Thêm deleteChatSession
    const navigation = useNavigation();

    const chatData = userProfile?.chatHistory ? [...userProfile.chatHistory].reverse() : [];

    const handlePress = (messages) => {
        navigation.navigate('Chatbot', { historyData: messages });
    };

    // Hàm xử lý xóa
    const handleDelete = (item) => {
        Alert.alert(
            "Xóa đoạn chat",
            "Bạn có muốn xóa đoạn hội thoại này vĩnh viễn?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => await deleteChatSession(item.id)
                }
            ]
        );
    };

    if (!chatData || chatData.length === 0) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Lịch sử Chatbot" showBackButton={true} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có lịch sử chat</Text>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }) => {
        // Kiểm tra an toàn để tránh lỗi undefined length
        const messages = Array.isArray(item.messages) ? item.messages : [];
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

        return (
            <TouchableOpacity style={styles.item} onPress={() => handlePress(messages)}>
                <View style={styles.avatar}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#2F847C" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{item.name || "Đoạn chat"}</Text>
                    <Text style={styles.preview} numberOfLines={1}>
                        {lastMsg
                            ? (lastMsg.sender === 'user' ? 'Bạn: ' : 'Bot: ') + lastMsg.text
                            : 'Không có nội dung'
                        }
                    </Text>
                </View>

                <View style={styles.rightContainer}>
                    <Text style={styles.time}>{item.time || ""}</Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                        <Ionicons name="trash-outline" size={20} color="#FF5252" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Lịch sử Chatbot" showBackButton={true} />
            <FlatList
                data={chatData}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 10 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    info: { flex: 1, marginRight: 10 },
    name: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
    preview: { fontSize: 13, color: '#888', marginTop: 4 },

    rightContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 40 },
    time: { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#999', marginBottom: 4 },
    deleteButton: { padding: 5 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 10, fontFamily: 'Nunito-Regular', color: '#999', fontSize: 16 }
});

export default ChatbotHistoryScreen;