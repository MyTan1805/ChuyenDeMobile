import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert 
} from 'react-native';
import { useAqiStore } from '../../../store/aqiStore';  

const AqiSettingsModal = ({ visible, onClose }) => {
  const { threshold, setThreshold } = useAqiStore();
  const [tempValue, setTempValue] = useState(String(threshold));

  useEffect(() => {
    if (visible) setTempValue(String(threshold));
  }, [visible, threshold]);

  const handleSave = () => {
    const val = parseInt(tempValue);
    if (isNaN(val) || val < 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số hợp lệ");
      return;
    }
    
    setThreshold(val); 
    Alert.alert("Thành công", "Đã lưu cài đặt!");
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Cài đặt cảnh báo</Text>
          <Text style={styles.label}>Cảnh báo khi PM2.5 vượt quá:</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempValue}
              onChangeText={setTempValue}
            />
            <Text style={styles.unit}>μg/m³</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.btnCancel]} onPress={onClose}>
              <Text style={styles.textStyle}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.btnSave]} onPress={handleSave}>
              <Text style={[styles.textStyle, {color:'white'}]}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  label: { marginBottom: 15, color: '#555' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: 80, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  unit: { marginLeft: 10, fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 15 },
  button: { borderRadius: 10, padding: 10, elevation: 2, minWidth: 90, alignItems: 'center' },
  btnCancel: { backgroundColor: '#f2f2f2' },
  btnSave: { backgroundColor: '#2E7D32' },
  textStyle: { fontWeight: 'bold' },
});

export default AqiSettingsModal;