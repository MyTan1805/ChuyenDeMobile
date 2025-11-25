import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../../config/firebaseConfig'; 

const functions = getFunctions(app, 'asia-southeast1');

export const sendMessageToAI = async (message) => {
  try {
    const chatFunction = httpsCallable(functions, 'chatWithAI');
    const result = await chatFunction({ message });
    return result.data; // Trả về { text: "..." }
  } catch (error) {
    console.error("Lỗi Chat:", error);
    throw error;
  }
};