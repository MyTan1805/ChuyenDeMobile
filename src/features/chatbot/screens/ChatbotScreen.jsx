// src/features/chatbot/screens/ChatbotScreen.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../../components/CustomHeader';
import { sendMessageToAI, speakText } from '../api/chatApi';

// Tin nhắn chào mặc định
const INITIAL_MESSAGES = [
  {
    id: '1',
    text: 'Xin chào! Tôi là EcoBot. Tôi có thể giúp gì cho bạn về môi trường hôm nay? 🌱',
    sender: 'bot'
  }
];

// Gợi ý cố định (không thay đổi theo mùa)
const DEFAULT_SUGGESTIONS = [
  "Cách phân loại pin cũ? 🔋",
  "Luật môi trường mới nhất? ⚖️",
  "Mẹo sống xanh mỗi ngày? 🌿",
  "Rác nhựa tái chế thế nào? ♻️"
];

const ChatbotScreen = ({ navigation }) => {
  // State quản lý
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const flatListRef = useRef();

  // Hàm gửi tin nhắn
  const handleSend = async (text = inputText) => {
    if (!text.trim()) return;

    // 1. Hiện tin nhắn của User
    const userMsg = { 
      id: Date.now().toString(), 
      text: text, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Scroll xuống đáy
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      // 2. Gọi API Backend
      const response = await sendMessageToAI(text);
      
      // 3. Hiện câu trả lời của Bot
      const botMsg = { 
        id: (Date.now() + 1).toString(), 
        text: response.text, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);

      // 4. Cập nhật gợi ý động (nếu AI trả về)
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }

    } catch (error) {
      const errorMsg = { 
        id: Date.now().toString(), 
        text: "Xin lỗi, kết nối đang chập chờn. Bạn thử lại nhé! 😔", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  // Hàm đọc tin nhắn bằng giọng nói (FR-5.2)
  const handleSpeak = async (text) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    await speakText(text);
    
    // Giả lập thời gian đọc (thực tế cần lắng nghe sự kiện từ expo-speech)
    setTimeout(() => {
      setIsSpeaking(false);
    }, text.length * 50); // Ước tính ~50ms/ký tự
  };

  // Render từng tin nhắn
  const renderItem = ({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[styles.msgRow, isBot ? styles.msgRowBot : styles.msgRowUser]}>
        {isBot && (
          <View style={styles.botAvatar}>
            <MaterialCommunityIcons name="robot-happy" size={24} color="#fff" />
          </View>
        )}
        
        <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
          <Text style={[styles.msgText, isBot ? styles.textBot : styles.textUser]}>
            {item.text}
          </Text>
          
          {/* Nút đọc giọng nói (chỉ hiện với tin của Bot) */}
          {isBot && (
            <TouchableOpacity 
              style={styles.speakBtn}
              onPress={() => handleSpeak(item.text)}
              disabled={isSpeaking}
            >
              <Ionicons 
                name={isSpeaking ? "volume-high" : "volume-medium-outline"} 
                size={18} 
                color="#555" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Trợ lý môi trường"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Hiển thị khi Bot đang suy nghĩ */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>EcoBot đang nhập...</Text>
          </View>
        )}

        {/* Danh sách Gợi ý (Chips) - Không còn header theo mùa */}
        {!loading && (
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionHeader}>💬 Gợi ý câu hỏi</Text>
            
            <FlatList 
              horizontal 
              data={suggestions}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.chip} 
                  onPress={() => handleSend(item)}
                >
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Thanh nhập liệu */}
        <View style={styles.inputBar}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => {
              // TODO: Tích hợp Speech-to-Text
              alert('Chức năng nhận diện giọng nói đang phát triển 🎤');
            }}
          >
            <Ionicons name="mic-outline" size={28} color="#555" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Nhắn tin..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
            multiline
            onSubmitEditing={() => handleSend(inputText)}
          />

          <TouchableOpacity 
            style={[
              styles.sendBtn,
              (!inputText.trim() || loading) && styles.sendBtnDisabled
            ]} 
            onPress={() => handleSend(inputText)}
            disabled={loading || !inputText.trim()}
          >
            {loading ? 
              <ActivityIndicator size="small" color="white" /> : 
              <Ionicons name="send" size={20} color="white" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  listContent: { 
    padding: 15, 
    paddingBottom: 10 
  },

  msgRow: { 
    flexDirection: 'row', 
    marginBottom: 15, 
    alignItems: 'flex-end' 
  },
  msgRowBot: { 
    justifyContent: 'flex-start' 
  },
  msgRowUser: { 
    justifyContent: 'flex-end' 
  },

  botAvatar: {
    width: 36, 
    height: 36, 
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10
  },

  bubble: { 
    padding: 12, 
    borderRadius: 18, 
    maxWidth: '75%',
    position: 'relative'
  },
  bubbleBot: { 
    backgroundColor: '#F0F0F0', 
    borderBottomLeftRadius: 4 
  },
  bubbleUser: { 
    backgroundColor: '#2E7D32', 
    borderBottomRightRadius: 4 
  },

  msgText: { 
    fontSize: 16, 
    lineHeight: 22 
  },
  textBot: { 
    color: '#333' 
  },
  textUser: { 
    color: '#fff' 
  },

  speakBtn: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },

  loadingContainer: {
    marginLeft: 20, 
    marginBottom: 10
  },
  loadingText: {
    fontStyle: 'italic', 
    color: '#999'
  },

  suggestionContainer: {
    paddingVertical: 10, 
    paddingHorizontal: 10, 
    backgroundColor: '#fff',
  },
  suggestionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
    marginLeft: 5
  },
  chip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderRadius: 20, 
    marginRight: 8,
    borderWidth: 1, 
    borderColor: '#C8E6C9'
  },
  chipText: { 
    fontSize: 13, 
    color: '#2E7D32' 
  },

  inputBar: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10,
    borderTopWidth: 1, 
    borderTopColor: '#EEE', 
    backgroundColor: '#F9F9F9',
  },
  iconBtn: { 
    padding: 5 
  },
  input: {
    flex: 1, 
    minHeight: 40, 
    maxHeight: 100,
    backgroundColor: '#fff', 
    borderRadius: 20,
    paddingHorizontal: 15, 
    fontSize: 16, 
    marginHorizontal: 10,
    borderWidth: 1, 
    borderColor: '#DDD'
  },
  sendBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  sendBtnDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.6
  }
});

export default ChatbotScreen;