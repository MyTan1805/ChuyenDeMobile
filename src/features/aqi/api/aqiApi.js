// src/features/aqi/api/aqiApi.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../../config/firebaseConfig';

// Quan trọng: Phải khớp region với bên functions/index.js (asia-southeast1)
const functions = getFunctions(app, 'asia-southeast1');

export const fetchAqiDataByCoords = async (lat, lon) => {
  try {
    console.log(`Calling Backend with coords: ${lat}, ${lon}`);
    
    // 'getAqiData' là tên hàm bạn đã viết trong functions/index.js
    const getAqiFunction = httpsCallable(functions, 'getAqiData');
    
    // Gọi hàm và đợi kết quả
    const result = await getAqiFunction({ lat, lon });
    
    console.log("Data received from server:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in fetchAqiDataByCoords:", error);
    throw error;  
  }
};

export const fetchAqiHistory = async (lat, lon, start, end) => {
  try {
    const getHistoryFunc = httpsCallable(functions, 'getAqiHistory');
    const result = await getHistoryFunc({ lat, lon, start, end });
    return result.data;
  } catch (error) {
    console.error("Error fetching History:", error);
    throw error;
  }
};