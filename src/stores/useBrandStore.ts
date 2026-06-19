import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Brand, BrandRecommendation } from '../types/brand';

interface BrandState {
  recommendations: BrandRecommendation[];
  selectedRecommendation: BrandRecommendation | null;
  brand: Brand | null;
  isLoading: boolean;
  setRecommendations: (recs: BrandRecommendation[]) => void;
  selectRecommendation: (rec: BrandRecommendation) => void;
  setBrand: (brand: Brand) => void;
  setLoading: (loading: boolean) => void;
  clearBrand: () => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      recommendations: [],
      selectedRecommendation: null,
      brand: null,
      isLoading: false,
      setRecommendations: (recommendations) => set({ recommendations }),
      selectRecommendation: (rec) => set({ selectedRecommendation: rec }),
      setBrand: (brand) => set({ brand }),
      setLoading: (isLoading) => set({ isLoading }),
      clearBrand: () => set({ recommendations: [], selectedRecommendation: null, brand: null }),
    }),
    {
      name: 'sideforge-brand',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ brand: state.brand, recommendations: state.recommendations }),
    }
  )
);
