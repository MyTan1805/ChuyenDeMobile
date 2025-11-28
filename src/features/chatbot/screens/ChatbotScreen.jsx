// src/features/chatbot/screens/ChatbotScreen.jsx

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../../components/CustomHeader';
import { sendMessageToAI, speakText } from '../api/chatApi';
import { useUserStore } from '@/store/userStore';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Xin chào! Tôi là EcoBot. Tôi có thể giúp gì cho bạn?', sender: 'bot' }
];

const DEFAULT_SUGGESTIONS = ["Cách phân loại pin cũ? 🔋", "Luật môi trường mới nhất? ⚖️", "Mẹo sống xanh? 🌿"];

const ChatbotScreen = ({ navigation, route }) => {
    // 1. Nhận dữ liệu lịch sử từ màn hình danh sách (nếu có)
    const historyData = route.params?.historyData;
    const isHistoryView = !!historyData; // Cờ kiểm tra xem có phải đang xem lại lịch sử không

    // Nếu có historyData thì dùng nó làm giá trị khởi tạo, nếu không dùng tin nhắn chào mặc định
    const [messages, setMessages] = useState(historyData || INITIAL_MESSAGES);
    
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const flatListRef = useRef();

    const { addChatToHistory } = useUserStore();

    // 2. Logic xử lý nút Back theo yêu cầu
    const handleBackPress = () => {
        if (isHistoryView) {
            // YÊU CẦU: Khi xem lịch sử, bấm Back phải về Trang chủ
            navigation.navigate('MainTabs'); 
        } else {
            // Trường hợp chat bình thường, quay lại màn hình trước
            navigation.goBack();
        }
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now().toString(), text: text, sender: 'user' };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setLoading(true);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

        try {
            const response = await sendMessageToAI(text);
            const botMsg = { id: (Date.now() + 1).toString(), text: response.text, sender: 'bot' };
            const finalMessages = [...newMessages, botMsg];
            setMessages(finalMessages);

            if (response.suggestions?.length > 0) setSuggestions(response.suggestions);

            // Lưu chat vào lịch sử
            // Lưu ý: Nếu đang xem lịch sử mà chat tiếp, nó sẽ tạo ra bản ghi lịch sử mới (hoặc bạn cần logic update)
            await addChatToHistory(finalMessages);

        } catch (error) {
            const errorMsg = { id: Date.now().toString(), text: "Lỗi kết nối.", sender: 'bot' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
    };

    const handleSpeak = async (text) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        await speakText(text);
        setTimeout(() => { setIsSpeaking(false); }, text.length * 50);
    };

    const renderItem = ({ item }) => {
        const isBot = item.sender === 'bot';
        return (
            <View style={[styles.msgRow, isBot ? styles.msgRowBot : styles.msgRowUser]}>
                {isBot && <View style={styles.botAvatar}><MaterialCommunityIcons name="robot-happy" size={24} color="#fff" /></View>}
                <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
                    <Text style={[styles.msgText, isBot ? styles.textBot : styles.textUser]}>{item.text}</Text>
                    {isBot && (
                        <TouchableOpacity style={styles.speakBtn} onPress={() => handleSpeak(item.text)} disabled={isSpeaking}>
                            <Ionicons name={isSpeaking ? "volume-high" : "volume-medium-outline"} size={18} color="#555" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader
                title={isHistoryView ? "Chi tiết lịch sử" : "Trợ lý môi trường"}
                showBackButton={true}
                
                // 3. Gắn hàm xử lý Back tùy chỉnh
                onBackPress={handleBackPress} 
                
                // Nếu đang xem lịch sử thì ẩn nút settings đi để tránh rối
                showSettingsButton={!isHistoryView} 
                rightIconName="time-outline"
                onSettingsPress={() => navigation.navigate('ChatbotHistory')}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id || Math.random().toString()} // Fallback key nếu id trùng
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
                
                {loading && <Text style={{ marginLeft: 20, marginBottom: 10, fontStyle: 'italic', color: '#888' }}>EcoBot đang nhập...</Text>}
                
                {/* 4. Vẫn cho phép chat tiếp kể cả khi xem lịch sử (tùy chọn) */}
                <View style={styles.inputArea}>
                    {!isHistoryView && !loading && (
                        <View style={styles.suggestionContainer}>
                            <FlatList horizontal data={suggestions} showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.chip} onPress={() => handleSend(item)}>
                                        <Text style={styles.chipText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                    <View style={styles.inputBar}>
                        <TextInput 
                            style={styles.input} 
                            placeholder={isHistoryView ? "Tiếp tục cuộc trò chuyện..." : "Nhắn tin..."} 
                            value={inputText} 
                            onChangeText={setInputText} 
                            placeholderTextColor="#999" 
                            multiline 
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(inputText)} disabled={loading || !inputText.trim()}>
                            {loading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="send" size={20} color="white" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    listContent: { padding: 15, paddingBottom: 10 },
    msgRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
    msgRowBot: { justifyContent: 'flex-start' },
    msgRowUser: { justifyContent: 'flex-end' },
    botAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    bubble: { padding: 12, borderRadius: 18, maxWidth: '75%', position: 'relative' },
    bubbleBot: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: 4 },
    bubbleUser: { backgroundColor: '#2E7D32', borderBottomRightRadius: 4 },
    msgText: { fontSize: 16, lineHeight: 22 },
    textBot: { color: '#333' },
    textUser: { color: '#fff' },
    speakBtn: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 2 },
    
    inputArea: { backgroundColor: '#fff' },
    suggestionContainer: { paddingVertical: 5, paddingHorizontal: 10 },
    chip: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#C8E6C9' },
    chipText: { fontSize: 13, color: '#2E7D32' },
    inputBar: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#F9F9F9' },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, fontSize: 16, marginHorizontal: 10, borderWidth: 1, borderColor: '#DDD' },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' }
});

export default ChatbotScreen;