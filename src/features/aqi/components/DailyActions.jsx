import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const mockActions = [
    { id: 1, text: 'Tắt đèn khi ra khỏi phòng', points: 10, completed: false },
    { id: 2, text: 'Sử dụng túi vải khi mua sắm', points: 15, completed: false },
    { id: 3, text: 'Phân loại rác tại nhà', points: 20, completed: true },
    { id: 4, text: 'Trồng một cây xanh mới', points: 50, completed: false },
];

const DailyActions = () => {
    const [actions, setActions] = useState(mockActions);

    const toggleAction = (id) => {
        const newActions = actions.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
        setActions(newActions);
    };

    const completedCount = actions.filter(a => a.completed).length;
    const progress = Math.round((completedCount / actions.length) * 100);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gợi ý hành động xanh mỗi ngày</Text>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Tiến độ</Text>
                    <Text style={styles.headerText}>{progress}% hoàn thành</Text>
                </View>
                
                {/* Thanh Progress Bar */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>

                {/* Danh sách hành động */}
                {actions.map((action) => (
                    <TouchableOpacity 
                        key={action.id} 
                        style={styles.actionItem}
                        onPress={() => toggleAction(action.id)}
                    >
                        <View style={[styles.checkbox, action.completed && styles.checked]}>
                            {action.completed && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.actionText}>{action.text}</Text>
                        <Text style={styles.points}>{action.points} điểm</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 30 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    card: { backgroundColor: '#F0F0F0', borderRadius: 15, padding: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    headerText: { fontSize: 12, color: '#666' },
    progressBarBg: { height: 8, backgroundColor: '#FFF', borderRadius: 4, marginBottom: 20, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
    actionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#666', marginRight: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    checked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    checkmark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    actionText: { flex: 1, fontSize: 14, color: '#333' },
    points: { fontSize: 12, fontWeight: 'bold', color: '#666' },
});

export default DailyActions;