import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAqiStore = create(
  persist(
    (set) => ({
      threshold: 150, 
      setThreshold: (value) => set({ threshold: value }),
    }),
    {
      name: 'aqi-storage', 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);