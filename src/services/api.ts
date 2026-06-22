import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem('token', token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // 관리자 플랜 시뮬레이션 — 백엔드에서 해당 플랜으로 데이터 필터링
  const { useAuthStore } = await import('../stores/useAuthStore');
  const simulatePlan = useAuthStore.getState().simulatePlan;
  if (simulatePlan) headers['X-Simulate-Plan'] = simulatePlan;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string; plan: string; analysisCount: number; avatar?: string };
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export const api = {
  // Auth
  signup: (email: string, password: string, name?: string) =>
    request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  googleAuth: (idToken: string) =>
    request<AuthResponse>('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),

  me: () => request<AuthResponse['user']>('/api/auth/me'),

  // Analysis
  analyzeYouTube: (url: string) =>
    request<{ reportId: string; channel: any; analysis: any }>('/api/analyze/youtube', { method: 'POST', body: JSON.stringify({ url }) }),

  getReport: (reportId: string) => request<any>(`/api/report/${reportId}`),

  getMyReports: () => request<{ reports: any[] }>('/api/reports'),

  // Admin
  adminStats: () => request<{ todayReports: number; totalUsers: number; totalReports: number }>('/api/admin/stats'),
  adminUsers: () => request<{ users: any[] }>('/api/admin/users'),
};
