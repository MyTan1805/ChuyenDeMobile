// src/store/aqiStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAqiStore = create(
  persist(
    (set) => ({
      threshold: 150, // Giá trị mặc định
      setThreshold: (value) => set({ threshold: value }),
    }),
    {
      name: 'aqi-storage', // Tên key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);