import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateDailyActions } from '../api/aiActionsApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/userStore'; 

const DailyActions = () => {
  const [actions, setActions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const addPointsToUser = useUserStore((state) => state.addPointsToUser);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date().toDateString();
      
      const savedData = await AsyncStorage.getItem('DAILY_ACTIONS_STATE');
      const parsedData = savedData ? JSON.parse(savedData) : null;

      if (parsedData && parsedData.date === today) {
        setActions(parsedData.actions);
        calculateProgress(parsedData.actions);
        setLoading(false);
      } else {
        console.log("🤖 Calling AI for Daily Actions...");
        const aiActions = await generateDailyActions();
        
        const cleanActions = aiActions.map(action => ({ ...action, checked: false }));
        setActions(cleanActions);
        calculateProgress(cleanActions);
        
        await AsyncStorage.setItem('DAILY_ACTIONS_STATE', JSON.stringify({
            date: today,
            actions: cleanActions
        }));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading daily actions:', error);
      setLoading(false);
    }
  };

  const calculateProgress = (list) => {
    if (!list || list.length === 0) return setProgress(0);
    const checkedCount = list.filter(a => a.checked).length;
    setProgress(Math.round((checkedCount / list.length) * 100));
  };

  const toggleAction = async (id) => {
    const currentAction = actions.find(a => a.id === id);
    if (!currentAction) return;

    const isChecking = !currentAction.checked; 
    const points = currentAction.points || 10;  

    const updatedActions = actions.map(action =>
      action.id === id ? { ...action, checked: isChecking } : action
    );
    setActions(updatedActions);
    calculateProgress(updatedActions);

    const today = new Date().toDateString();
    await AsyncStorage.setItem('DAILY_ACTIONS_STATE', JSON.stringify({
        date: today,
        actions: updatedActions
    }));

    if (isChecking) {
        const result = await addPointsToUser(points);
        if (result.success) {
        } else {
             Alert.alert("Lỗi", "Không thể cộng điểm (kiểm tra mạng).");
        }
    } else {
        const result = await addPointsToUser(-points);
        if (!result.success) {
             console.log("Lỗi trừ điểm");
        }
    }
  };

  const season = new Date().getMonth() + 1 >= 5 && new Date().getMonth() + 1 <= 11 ? 'mùa mưa' : 'mùa khô';
  const seasonEmoji = season === 'mùa mưa' ? '🌧️' : '☀️';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2F847C" />
        <Text style={styles.loadingText}>Đang tải gợi ý...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.headerTextRow}>
            <Text style={styles.seasonText}>{seasonEmoji} Gợi ý {season}</Text>
            <Text style={styles.progressText}>{progress}% hoàn thành</Text>
        </View>
      </View>

      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.actionItem, action.checked && styles.actionItemChecked]}
          onPress={() => toggleAction(action.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, action.checked && styles.checkboxChecked]}>
            {action.checked && <Ionicons name="checkmark" size={16} color="white" />}
          </View>

          <View style={styles.contentBox}>
            <View style={styles.titleRow}>
                <Ionicons name={action.icon} size={18} color={action.checked ? "#2F847C" : "#555"} style={{marginRight: 5}} />
                <Text style={[styles.title, action.checked && styles.textChecked]}>{action.title}</Text>
            </View>
            <Text style={styles.desc}>{action.description}</Text>
          </View>

          <View style={styles.pointBadge}>
            <Text style={styles.pointText}>+{action.points}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F7F9FC', borderRadius: 16, padding: 15 },
  loadingContainer: { padding: 20, alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 16 },
  loadingText: { marginTop: 10, color: '#666', fontFamily: 'Nunito-Regular' },
  header: { marginBottom: 15 },
  progressBarBg: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
  headerTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  seasonText: { fontSize: 12, color: '#2F847C', fontFamily: 'Nunito-Bold', textTransform: 'capitalize' },
  progressText: { fontSize: 12, color: '#666', fontFamily: 'Nunito-Bold' },
  actionItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 12, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'transparent',
    shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  actionItemChecked: { borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
  checkbox: { 
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  contentBox: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  title: { fontSize: 15, fontFamily: 'Nunito-Bold', color: '#333' },
  textChecked: { textDecorationLine: 'line-through', color: '#888' },
  desc: { fontSize: 12, fontFamily: 'Nunito-Regular', color: '#666' },
  pointBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pointText: { fontSize: 12, fontFamily: 'Nunito-Bold', color: '#FF9800' }
});

export default DailyActions;