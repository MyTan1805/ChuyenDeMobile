import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, Image, Keyboard 
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getDIYIdeas } from '@/features/waste-guide/api/wasteIdApi'; // Import hàm vừa tạo

const RecycleDIYScreen = () => {
  const [material, setMaterial] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetIdeas = async () => {
    if (!material.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setIdeas([]); // Reset cũ

    const result = await getDIYIdeas(material);
    
    if (result && result.ideas) {
      setIdeas(result.ideas);
    }
    setLoading(false);
  };

  // Gợi ý nhanh
  const quickItems = ["Chai nhựa", "Giấy báo", "Lốp xe cũ", "Hộp carton"];

  return (
    <View style={styles.container}>
      <CustomHeader title="Góc Sáng Tạo DIY" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={50} color="#FFB74D" />
            <View style={{flex: 1, marginLeft: 15}}>
                <Text style={styles.bannerTitle}>Biến rác thành quà!</Text>
                <Text style={styles.bannerSub}>Nhập tên vật dụng bạn muốn tái chế, AI sẽ gợi ý ý tưởng.</Text>
            </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
            <TextInput 
                style={styles.input}
                placeholder="VD: Vỏ hộp sữa, quần jean cũ..."
                value={material}
                onChangeText={setMaterial}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleGetIdeas}>
                <Ionicons name="sparkles" size={20} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* Quick Tags */}
        <View style={styles.tagsRow}>
            {quickItems.map((item, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.tag}
                    onPress={() => { setMaterial(item); }}
                >
                    <Text style={styles.tagText}>{item}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Result Area */}
        <View style={styles.resultArea}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F847C" />
                    <Text style={styles.loadingText}>AI đang suy nghĩ ý tưởng...</Text>
                </View>
            ) : ideas.length > 0 ? (
                <>
                    <Text style={styles.sectionTitle}>✨ Gợi ý cho: {material}</Text>
                    {ideas.map((idea, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    {/* Map icon từ AI trả về */}
                                    <Ionicons name={idea.icon === 'home' ? 'home' : 'gift'} size={24} color="#2F847C" />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.cardTitle}>{idea.title}</Text>
                                    <Text style={styles.difficulty}>Độ khó: {idea.difficulty}</Text>
                                </View>
                            </View>
                            <View style={styles.divider}/>
                            <Text style={styles.steps}>{idea.steps}</Text>
                        </View>
                    ))}
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Image 
                        source={{uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'}} 
                        style={{width: 100, height: 100, opacity: 0.5}} 
                    />
                    <Text style={styles.emptyText}>Hãy nhập vật liệu để bắt đầu</Text>
                </View>
            )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { padding: 20 },
  
  banner: { 
    flexDirection: 'row', backgroundColor: '#FFF3E0', padding: 20, 
    borderRadius: 16, alignItems: 'center', marginBottom: 20 
  },
  bannerTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#E65100' },
  bannerSub: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#333', marginTop: 4 },

  inputContainer: { 
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, 
    padding: 5, elevation: 2, alignItems: 'center', marginBottom: 15
  },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 16, fontFamily: 'Nunito-Regular', height: 50 },
  sendBtn: { 
    backgroundColor: '#2F847C', width: 45, height: 45, 
    borderRadius: 10, justifyContent: 'center', alignItems: 'center' 
  },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tag: { backgroundColor: '#E0F2F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#00796B', fontFamily: 'Nunito-Bold', fontSize: 12 },

  center: { alignItems: 'center', marginTop: 30 },
  loadingText: { marginTop: 10, color: '#666', fontFamily: 'Nunito-Regular' },

  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#333', marginBottom: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, backgroundColor: '#E0F2F1', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333' },
  difficulty: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  steps: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#444', lineHeight: 20 },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#999', marginTop: 10, fontFamily: 'Nunito-Regular' }
});

export default RecycleDIYScreen;