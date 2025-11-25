// src/features/aqi/components/DailyActions.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateDailyActions } from '../api/aiActionsApi'; // 👈 API mới

// Fallback actions nếu AI lỗi
const FALLBACK_ACTIONS = {
  rainy: [
    {
      id: 1,
      icon: 'water',
      title: 'Phòng ngập do rác',
      description: 'Không vứt rác bừa bãi gây tắc cống',
      points: 15,
      checked: false
    },
    {
      id: 2,
      icon: 'leaf',
      title: 'Trồng cây chịu mưa',
      description: 'Trồng cây xanh giúp hút nước, chống ngập',
      points: 30,
      checked: false
    },
    {
      id: 3,
      icon: 'trash',
      title: 'Phân loại rác mùa mưa',
      description: 'Rác ướt dễ phân hủy cần xử lý đúng cách',
      points: 20,
      checked: false
    },
    {
      id: 4,
      icon: 'hand-left',
      title: 'Dọn rác sau mưa',
      description: 'Thu gom rác trôi dạt vào khu vực nhà',
      points: 25,
      checked: false
    }
  ],
  dry: [
    {
      id: 1,
      icon: 'water-outline',
      title: 'Tiết kiệm nước',
      description: 'Tắm ngắn, tắt vòi khi không dùng',
      points: 15,
      checked: false
    },
    {
      id: 2,
      icon: 'flame-outline',
      title: 'Phòng cháy rừng',
      description: 'Không đốt rác, dọn lá khô quanh nhà',
      points: 20,
      checked: false
    },
    {
      id: 3,
      icon: 'fitness',
      title: 'Bảo vệ sức khỏe',
      description: 'Đeo khẩu trang khi không khí xấu',
      points: 10,
      checked: false
    },
    {
      id: 4,
      icon: 'leaf',
      title: 'Tưới cây buổi sáng',
      description: 'Tưới cây sớm để giảm bay hơi nước',
      points: 15,
      checked: false
    }
  ]
};

const DailyActions = () => {
  const [actions, setActions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => {
    loadAiActions();
  }, []);

  const loadAiActions = async () => {
    setLoading(true);
    
    try {
      console.log('🤖 Loading AI-generated daily actions...');
      
      // Gọi AI để generate actions
      const aiActions = await generateDailyActions();
      
      if (aiActions && aiActions.length > 0) {
        setActions(aiActions);
        setIsAiGenerated(true);
        calculateProgress(aiActions); // 👈 Tính progress với data mới
        console.log('✅ AI actions loaded:', aiActions);
      } else {
        throw new Error('AI returned empty actions');
      }
      
    } catch (error) {
      console.log('⚠️ AI failed, using fallback actions');
      
      // Fallback: Dùng dữ liệu cố định theo mùa
      const currentMonth = new Date().getMonth() + 1;
      const season = currentMonth >= 5 && currentMonth <= 11 ? 'rainy' : 'dry';
      const fallbackActions = FALLBACK_ACTIONS[season];
      setActions(fallbackActions);
      setIsAiGenerated(false);
      calculateProgress(fallbackActions); // 👈 Tính progress với fallback data
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (actionsList) => {
    const checked = actionsList.filter(a => a.checked).length;
    const total = actionsList.length;
    setProgress(Math.round((checked / total) * 100));
  };

  const toggleAction = (id) => {
    const updatedActions = actions.map(action => 
      action.id === id ? { ...action, checked: !action.checked } : action
    );
    setActions(updatedActions);
    calculateProgress(updatedActions);
  };

  // Xác định mùa hiện tại
  const currentMonth = new Date().getMonth() + 1;
  const season = currentMonth >= 5 && currentMonth <= 11 ? 'rainy' : 'dry';
  const seasonEmoji = season === 'rainy' ? '🌧️' : '☀️';
  const seasonText = season === 'rainy' ? 'mùa mưa' : 'mùa khô';

  // Hiển thị loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Đang tạo gợi ý phù hợp...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với tiến độ */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% hoàn thành</Text>
        </View>
        
        <View style={styles.badgeRow}>
          <Text style={styles.seasonBadge}>
            {seasonEmoji} Gợi ý {seasonText}
          </Text>
          
          {/* Badge hiển thị nguồn dữ liệu */}
          {isAiGenerated && (
            <Text style={styles.aiBadge}>
              🤖 AI
            </Text>
          )}
        </View>
      </View>

      {/* Danh sách hành động */}
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionItem}
          onPress={() => toggleAction(action.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            action.checked && styles.checkboxChecked
          ]}>
            {action.checked && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>

          <View style={styles.actionContent}>
            <View style={styles.actionHeader}>
              <Ionicons 
                name={action.icon} 
                size={20} 
                color={action.checked ? "#2E7D32" : "#555"} 
              />
              <Text style={[
                styles.actionTitle,
                action.checked && styles.actionTitleChecked
              ]}>
                {action.title}
              </Text>
            </View>
            <Text style={styles.actionDescription}>
              {action.description}
            </Text>
          </View>

          <Text style={styles.points}>{action.points} điểm</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
  },
  loadingContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  header: {
    marginBottom: 15,
  },
  progressBar: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seasonBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  aiBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  actionTitleChecked: {
    color: '#2E7D32',
  },
  actionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginLeft: 28,
  },
  points: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 10,
  },
});

export default DailyActions;