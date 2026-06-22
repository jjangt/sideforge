import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sideforge-api.workers.dev';

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
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as any };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string; plan: string; analysisCount: number };
}

export const api = {
  signup: (email: string, password: string, name?: string) =>
    request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request<AuthResponse['user']>('/api/auth/me'),

  // ─── Analysis ───────────────────────────────────────────────────────────────

  analyzeYouTube: (url: string) =>
    request<{ reportId: string; channel: any; analysis: any }>('/api/analyze/youtube', { method: 'POST', body: JSON.stringify({ url }) }),

  getReport: (reportId: string) => request<any>(`/api/report/${reportId}`),

  getMyReports: () => request<{ reports: any[] }>('/api/reports'),
};
