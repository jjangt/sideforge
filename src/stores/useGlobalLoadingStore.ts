/**
 * 전역 로딩 상태 관리
 * 
 * 페이지 전환, API 호출 등에서 start/stop 호출하면
 * GlobalLoadingBar가 자동으로 표시/숨김
 * 
 * 사용 예시:
 *   import { globalLoading } from '../stores/useGlobalLoadingStore';
 *   globalLoading.start();
 *   await api.something();
 *   globalLoading.stop();
 */

import { create } from 'zustand';

interface GlobalLoadingState {
  isLoading: boolean;
  /** 동시에 여러 요청이 있을 수 있으므로 카운터로 관리 */
  count: number;
  start: () => void;
  stop: () => void;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>((set) => ({
  isLoading: false,
  count: 0,
  start: () => set((s) => ({ count: s.count + 1, isLoading: true })),
  stop: () => set((s) => {
    const next = Math.max(0, s.count - 1);
    return { count: next, isLoading: next > 0 };
  }),
}));

/** 명령형 API — import해서 바로 호출 */
export const globalLoading = {
  start: () => useGlobalLoadingStore.getState().start(),
  stop: () => useGlobalLoadingStore.getState().stop(),
};
