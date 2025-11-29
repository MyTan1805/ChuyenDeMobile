import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Image, ScrollView, ActivityIndicator, Alert, SafeAreaView, Keyboard, Dimensions 
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { identifyWasteWithAI } from '../api/wasteIdApi';
import { useUserStore } from '@/store/userStore'; 

// Dữ liệu fallback
const FALLBACK_LOCATIONS = [
    { name: "Trạm Tái chế Xanh", distance: "2.5 km" },
    { name: "Điểm thu gom Quận 1", distance: "3.2 km" }
];

// Từ khóa gợi ý nhanh
const QUICK_TAGS = ["Pin cũ", "Chai nhựa", "Vỏ hộp sữa", "Túi nilon", "Thức ăn thừa"];

const WasteSearchScreen = ({ navigation, route }) => {
  const { existingData = [] } = route.params || {};

  const [query, setQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [isClaimed, setIsClaimed] = useState(false);
  
  // LẤY HÀM TỪ STORE
  const confirmTrashSorted = useUserStore(state => state.confirmTrashSorted);

  // --- LOGIC ---
  const findLocationsForCategory = (categoryIdFromAI) => {
      if (!categoryIdFromAI || existingData.length === 0) return FALLBACK_LOCATIONS;
      const foundItem = existingData.find(item => 
          item.id.toLowerCase() === categoryIdFromAI.toLowerCase()
      );
      return foundItem && foundItem.locations ? foundItem.locations : FALLBACK_LOCATIONS;
  };

  // 1. HÀM XỬ LÝ "PROOF OF WORK" (Cộng điểm)
  const handleConfirmRecycle = async () => {
      if (isClaimed) return; 

      const result = await confirmTrashSorted(10); // Cộng 10 điểm

      if (result.success) {
          setIsClaimed(true); 
          Alert.alert(
              "Tuyệt vời! 🎉", 
              `Bạn đã phân loại đúng cách và nhận được +${result.points} điểm!\n\nChỉ số "Lần phân loại rác" trong hồ sơ đã tăng lên.`
          );
      } else {
          Alert.alert("Lỗi", "Không thể ghi nhận kết quả. Vui lòng thử lại.");
      }
  };

  // 2. HÀM CHUYỂN TRANG (Chỉ chuyển trang, không cộng điểm nữa)
  const handleViewDetail = () => {
      if (!aiResult) return;
      const matchedLocations = findLocationsForCategory(aiResult.category);
      
      navigation.navigate('WasteDetail', { 
          selectedCategory: { 
              name: aiResult.category, 
              title: aiResult.itemName, 
              image: imageUri,
              instructions: aiResult.instructions,
              locations: matchedLocations
          },
          allCategories: existingData 
      });
  };

  const callAI = async (textInput, imgInput) => {
    Keyboard.dismiss();
    setAnalyzing(true);
    setAiResult(null);
    setIsClaimed(false); // Reset trạng thái nhận thưởng khi tìm cái mới

    try {
      const result = await identifyWasteWithAI(imgInput, textInput); 
      if (result) {
        setAiResult(result);
      } else {
        Alert.alert("Thông báo", "AI không nhận diện được.");
      }
    } catch (error) {
      console.error("Lỗi AI:", error);
      Alert.alert("Lỗi", "Không thể kết nối với AI.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextSearch = () => {
    if (query.trim().length === 0) return;
    callAI(query, null);
    setImageUri(null);
  };

  const onTagPress = (tag) => {
      setQuery(tag);
      callAI(tag, null);
      setImageUri(null);
  };

  const pickImage = async (useCamera = false) => {
    try {
      let permissionResult;
      if (useCamera) permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      else permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert("Thiếu quyền", "Cần quyền Camera/Thư viện.");
        return;
      }

      const MediaType = ImagePicker.MediaTypeOptions || ImagePicker.MediaType;
      const options = { mediaTypes: MediaType.Images, allowsEditing: true, quality: 0.5, base64: false };

      let result;
      if (useCamera) result = await ImagePicker.launchCameraAsync(options);
      else result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        callAI(null, uri);
      } 
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <View style={styles.container}>
      <CustomHeader title="Trợ lý Phân loại AI" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* 1. HERO TEXT */}
        <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Bạn muốn phân loại{"\n"}gì hôm nay?</Text>
            <Text style={styles.heroSub}>Sử dụng AI để nhận diện rác thải chính xác</Text>
        </View>

        {/* 2. SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#2F847C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập tên rác (vd: vỏ lon...)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleTextSearch}
            placeholderTextColor="#999"
          />
          {query.length > 0 && (
             <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
             </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleTextSearch} style={styles.searchBtn}>
             <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 3. SUGGESTED TAGS */}
        {!aiResult && !analyzing && !imageUri && (
            <View style={styles.tagsWrapper}>
                <Text style={styles.tagHeader}>Tìm kiếm nhanh:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                    {QUICK_TAGS.map((tag, index) => (
                        <TouchableOpacity key={index} style={styles.quickTag} onPress={() => onTagPress(tag)}>
                            <Text style={styles.quickTagText}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}

        {/* 4. SCAN ACTION CARDS */}
        {!aiResult && !analyzing && !imageUri && (
            <View style={styles.actionGrid}>
                <TouchableOpacity style={[styles.actionCard, styles.cardCamera]} onPress={() => pickImage(true)}>
                    <View style={styles.iconCircleCamera}>
                        <Ionicons name="camera" size={32} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>Chụp ảnh</Text>
                    <Text style={styles.cardSub}>Dùng camera để quét</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, styles.cardGallery]} onPress={() => pickImage(false)}>
                    <View style={styles.iconCircleGallery}>
                        <Ionicons name="images" size={32} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>Thư viện</Text>
                    <Text style={styles.cardSub}>Chọn ảnh có sẵn</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* 5. HIỂN THỊ KẾT QUẢ */}
        
        {analyzing && (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#2F847C" />
                <Text style={styles.loadingText}>AI đang phân tích...</Text>
                <Text style={styles.loadingSub}>Vui lòng đợi trong giây lát</Text>
            </View>
        )}

        {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
              {!analyzing && (
                  <TouchableOpacity style={styles.retakeBtn} onPress={() => setImageUri(null)}>
                      <Ionicons name="refresh" size={20} color="#fff" />
                      <Text style={styles.retakeText}>Chọn lại</Text>
                  </TouchableOpacity>
              )}
            </View>
        )}

        {/* Result Card */}
        {aiResult && !analyzing && (
            <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                    <View>
                        <Text style={styles.resultLabel}>Kết quả nhận diện</Text>
                        <Text style={styles.resultName}>{aiResult.itemName}</Text>
                    </View>
                    <View style={styles.confidenceBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        <Text style={styles.confidenceText}> {aiResult.confidence || 'Cao'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                        <MaterialCommunityIcons name="recycle" size={24} color="#2F847C" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.infoLabel}>Phân loại</Text>
                        <Text style={styles.infoValue}>{aiResult.category}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={[styles.infoIconBox, {backgroundColor: '#FFF3E0'}]}>
                        <MaterialCommunityIcons name="text-box-check-outline" size={24} color="#FF9800" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.infoLabel}>Hướng dẫn</Text>
                        <Text style={styles.infoDesc}>{aiResult.instructions}</Text>
                    </View>
                </View>

                {/* NÚT 1: XÁC NHẬN ĐÃ LÀM (Cộng điểm) */}
                {!isClaimed ? (
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={handleConfirmRecycle}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.confirmButtonText}>Xác nhận đã xử lý (+10đ)</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.claimedBadge}>
                        <Text style={styles.claimedText}>Đã ghi nhận thành tích ✓</Text>
                    </View>
                )}

                {/* NÚT 2: XEM CHI TIẾT (Chuyển trang, KHÔNG cộng điểm) */}
                <TouchableOpacity 
                    style={styles.detailButton}
                    onPress={handleViewDetail}
                >
                    <Text style={styles.detailBtnText}>Xem chi tiết & Điểm thu gom</Text>
                    <Ionicons name="arrow-forward" size={18} color="#2F847C" />
                </TouchableOpacity>
            </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' }, 
  content: { padding: 20 },

  heroSection: { marginBottom: 25, marginTop: 10 },
  heroTitle: { fontFamily: 'Nunito-Bold', fontSize: 28, color: '#333', lineHeight: 36 },
  heroSub: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#666', marginTop: 5 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, height: 60, marginBottom: 15,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  searchIcon: { marginLeft: 20, marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333' },
  clearBtn: { padding: 10 },
  searchBtn: { 
      backgroundColor: '#2F847C', height: 50, width: 50, borderRadius: 12,
      justifyContent: 'center', alignItems: 'center', marginRight: 5
  },

  tagsWrapper: { marginBottom: 30 },
  tagHeader: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888', marginBottom: 10 },
  tagsScroll: { flexDirection: 'row' },
  quickTag: {
      backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 20, marginRight: 10,
      borderWidth: 1, borderColor: '#E0E0E0'
  },
  quickTagText: { fontFamily: 'Nunito-Regular', color: '#555', fontSize: 14 },

  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCard: {
      width: '48%', padding: 20, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
  },
  cardCamera: { backgroundColor: '#2F847C' }, 
  cardGallery: { backgroundColor: '#4DB6AC' }, 
  iconCircleCamera: { 
      width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  iconCircleGallery: { 
      width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#fff', marginBottom: 4 },
  cardSub: { fontFamily: 'Nunito-Regular', fontSize: 13, color: 'rgba(255,255,255,0.9)' },

  loadingBox: { alignItems: 'center', marginVertical: 40 },
  loadingText: { marginTop: 15, fontSize: 18, fontFamily: 'Nunito-Bold', color: '#2F847C' },
  loadingSub: { marginTop: 5, fontSize: 14, fontFamily: 'Nunito-Regular', color: '#888' },

  previewContainer: { 
      width: '100%', height: 250, borderRadius: 20, backgroundColor: '#000',
      overflow: 'hidden', marginBottom: 20, position: 'relative'
  },
  previewImage: { width: '100%', height: '100%' },
  retakeBtn: {
      position: 'absolute', top: 15, right: 15,
      flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
      alignItems: 'center'
  },
  retakeText: { color: '#fff', fontFamily: 'Nunito-Bold', marginLeft: 5, fontSize: 12 },

  resultContainer: {
      backgroundColor: '#fff', borderRadius: 20, padding: 20,
      shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
      marginBottom: 30
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultLabel: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#888' },
  resultName: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#333', marginTop: 4 },
  confidenceBadge: {
      flexDirection: 'row', backgroundColor: '#4CAF50',
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignItems: 'center'
  },
  confidenceText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 12 },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },

  infoRow: { flexDirection: 'row', marginBottom: 15 },
  infoIconBox: {
      width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F2F1',
      justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  infoLabel: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888', marginBottom: 2 },
  infoValue: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#2F847C' },
  infoDesc: { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#444', lineHeight: 22 },

  // --- SỬA STYLE NÚT BẤM ---
  confirmButton: {
      backgroundColor: '#4CAF50', // Màu xanh lá thành công
      flexDirection: 'row',
      justifyContent: 'center', alignItems: 'center',
      paddingVertical: 15, borderRadius: 16, marginTop: 10, marginBottom: 10,
      shadowColor: '#4CAF50', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  confirmButtonText: {
      fontFamily: 'Nunito-Bold', fontSize: 16, color: '#fff', marginLeft: 8
  },
  claimedBadge: {
      backgroundColor: '#E8F5E9',
      paddingVertical: 15, borderRadius: 16, marginTop: 10, marginBottom: 10,
      alignItems: 'center', borderWidth: 1, borderColor: '#C8E6C9'
  },
  claimedText: {
      fontFamily: 'Nunito-Bold', fontSize: 16, color: '#2E7D32'
  },
  
  // Nút Detail là nút phụ (Outlined)
  detailButton: {
      backgroundColor: '#fff', flexDirection: 'row',
      justifyContent: 'center', alignItems: 'center',
      paddingVertical: 15, borderRadius: 16,
      borderWidth: 1, borderColor: '#2F847C', // Đổi thành nút viền
  },
  detailBtnText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#2F847C', marginRight: 10 }
});

export default WasteSearchScreen;