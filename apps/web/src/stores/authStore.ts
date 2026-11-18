import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@generalstaff/shared-types';
import api from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      tokens: null,

      setAuth: (user: User, tokens: AuthTokens) => {
        api.setAccessToken(tokens.accessToken);
        set({ user, isAuthenticated: true, tokens });
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (_error) {
          console.error('Logout error:', _error);
        } finally {
          api.setAccessToken(null);
          set({ user: null, isAuthenticated: false, tokens: null });
        }
      },

      initialize: async () => {
        const { tokens } = get();
        if (tokens?.accessToken) {
          api.setAccessToken(tokens.accessToken);
          try {
            const response = await api.getMe();
            if (response.success && response.data) {
              set({ user: response.data, isAuthenticated: true });
            } else {
              get().logout();
            }
          } catch (_error) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ tokens: state.tokens }),
    }
  )
);