import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoachMessage } from '../types/coach';
import { suggestedQuestions } from '../services/ai/mock-data/coach';

interface CoachState {
  messages: CoachMessage[];
  suggestedQuestions: string[];
  isLoading: boolean;
  addMessage: (message: CoachMessage) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      messages: [],
      suggestedQuestions,
      isLoading: false,
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setLoading: (isLoading) => set({ isLoading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'sideforge-coach',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
