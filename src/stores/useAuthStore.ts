import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken, clearToken } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  analysisCount: number;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      signup: async (email, password, name) => {
        const { token, user } = await api.signup(email, password, name);
        await setToken(token);
        set({ user });
      },

      login: async (email, password) => {
        const { token, user } = await api.login(email, password);
        await setToken(token);
        set({ user });
      },

      loginWithGoogle: async () => {
        // Web: Google Identity Services를 통해 idToken 획득
        const idToken = await getGoogleIdToken();
        if (!idToken) throw new Error('Google 인증 취소');
        const { token, user } = await api.googleAuth(idToken);
        await setToken(token);
        set({ user });
      },

      logout: async () => {
        await clearToken();
        set({ user: null });
      },

      loadUser: async () => {
        try {
          set({ isLoading: true });
          const user = await api.me();
          set({ user, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'sideforge-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// ─── Google Identity Services (Web) ───────────────────────────────────────────

function getGoogleIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) { resolve(null); return; }

    // @ts-ignore - Google Identity Services global
    if (typeof google === 'undefined' || !google.accounts) { resolve(null); return; }

    // @ts-ignore
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => resolve(response.credential || null),
    });

    // @ts-ignore
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) resolve(null);
    });
  });
}
