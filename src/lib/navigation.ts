import { router, useLocalSearchParams } from 'expo-router';

export const ROUTES = {
  landing: '/',
  auth: '/auth',
  analyze: '/analyze',
  mypage: '/mypage',
  contact: '/contact',
  admin: '/admin',
  pricing: '/pricing',
  terms: '/terms',
  privacy: '/privacy',
  report: (id: string) => `/report/${id}` as const,
  // 기존 브랜드 생성 플로우
  onboarding: '/onboarding',
  recommendations: '/recommendations',
  brandGenerate: '/brand/generate',
  brandDetail: (id: string) => `/brand/${id}` as const,
  brandPreview: (id: string) => `/brand/${id}/preview` as const,
  dashboard: '/dashboard',
  coach: '/coach',
} as const;

export function navigate(path: string, options?: { replace?: boolean }) {
  if (options?.replace) {
    router.replace(path as any);
  } else {
    router.push(path as any);
  }
}

export function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    navigate(ROUTES.landing, { replace: true });
  }
}

export function useRouteParams<T extends Record<string, string>>() {
  return useLocalSearchParams<T>();
}
