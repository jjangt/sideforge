import { create } from 'zustand';
import { BrandDashboard } from '../types/dashboard';

interface DashboardState {
  dashboard: BrandDashboard | null;
  isLoading: boolean;
  setDashboard: (dashboard: BrandDashboard) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  dashboard: null,
  isLoading: false,
  setDashboard: (dashboard) => set({ dashboard }),
  setLoading: (isLoading) => set({ isLoading }),
}));
