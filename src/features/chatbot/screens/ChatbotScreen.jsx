import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../../components/CustomHeader';
import { sendMessageToAI } from '../api/chatApi';

// Tin nhắn chào mặc định
const INITIAL_MESSAGES = [
  { 
    id: '1', 
    text: 'Xin chào! Tôi là EcoBot. Tôi có thể giúp gì cho bạn về môi trường hôm nay? 🌱', 
    sender: 'bot' 
  }
];

// Gợi ý hành động/câu hỏi (FR-5.3)
const SUGGESTIONS = [
  "Cách phân loại pin cũ? 🔋",
  "Luật môi trường mới nhất? ⚖️",
  "Mẹo sống xanh mỗi ngày? 🌿",
  "Rác nhựa tái chế thế nào? ♻️"
];

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  // Hàm gửi tin nhắn
  const handleSend = async (text = inputText) => {
    if (!text.trim()) return;

    // 1. Hiện tin nhắn của User lên màn hình
    const userMsg = { id: Date.now().toString(), text: text, sender: 'user' };
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
        />

        {/* Hiển thị khi Bot đang suy nghĩ */}
        {loading && (
          <View style={{ marginLeft: 20, marginBottom: 10 }}>
             <Text style={{fontStyle: 'italic', color: '#999'}}>EcoBot đang nhập...</Text>
          </View>
        )}

        {/* Danh sách Gợi ý (Chips) */}
        {!loading && (
          <View style={styles.suggestionContainer}>
              <FlatList 
                  horizontal 
                  data={SUGGESTIONS}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  renderItem={({item}) => (
                      <TouchableOpacity style={styles.chip} onPress={() => handleSend(item)}>
                          <Text style={styles.chipText}>{item}</Text>
                      </TouchableOpacity>
                  )}
              />
          </View>
        )}

        {/* Thanh nhập liệu */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.iconBtn}>
             <Ionicons name="add-circle-outline" size={30} color="#555" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Nhắn tin..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
            multiline
          />

          <TouchableOpacity 
            style={styles.sendBtn} 
            onPress={() => handleSend(inputText)}
            disabled={loading || !inputText.trim()}
          >
             {loading ? 
               <ActivityIndicator size="small" color="white"/> : 
               <Ionicons name="send" size={20} color="white" />
             }
          </TouchableOpacity>
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

  botAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#333', 
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10
  },
  
  bubble: { padding: 12, borderRadius: 18, maxWidth: '75%' },
  bubbleBot: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: '#2E7D32', borderBottomRightRadius: 4 },

  msgText: { fontSize: 16, lineHeight: 22 },
  textBot: { color: '#333' },
  textUser: { color: '#fff' },

  suggestionContainer: { 
    paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#fff',
  },
  chip: {
    backgroundColor: '#E8F5E9', // Xanh nhạt
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
    borderWidth: 1, borderColor: '#C8E6C9'
  },
  chipText: { fontSize: 13, color: '#2E7D32' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#F9F9F9',
  },
  iconBtn: { padding: 5 },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100,
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 15, fontSize: 16, marginHorizontal: 10,
    borderWidth: 1, borderColor: '#DDD'
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center', alignItems: 'center'
  }
});

export default ChatbotScreen;