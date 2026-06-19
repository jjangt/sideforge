import { router, useLocalSearchParams } from 'expo-router';

/**
 * 앱 내 모든 라우트 정의.
 * 파라미터 타입을 명시하여 타입 안전성 보장.
 */
export const ROUTES = {
  landing: '/',
  onboarding: '/onboarding',
  recommendations: '/recommendations',
  brandGenerate: '/brand/generate',
  brandDetail: (id: string) => `/brand/${id}` as const,
  brandPreview: (id: string) => `/brand/${id}/preview` as const,
  dashboard: '/dashboard',
  coach: '/coach',
} as const;

type StaticRoute = '/' | '/onboarding' | '/recommendations' | '/brand/generate' | '/dashboard' | '/coach';

/**
 * 페이지 이동 함수.
 * replace: true면 히스토리 스택 대체 (뒤로가기 시 이전 페이지로 안 돌아감)
 */
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

/**
 * URL search params에서 값을 타입 안전하게 꺼내는 훅.
 * 새로고침 시에도 파라미터 유지됨.
 */
export function useRouteParams<T extends Record<string, string>>() {
  return useLocalSearchParams<T>();
}
