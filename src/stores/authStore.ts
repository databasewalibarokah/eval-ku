import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user) => {
    set({ user, isAuthenticated: true });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('ku_users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              set({ user: data as User, isAuthenticated: true, isLoading: false });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const { isAuthenticated } = get();
      if (session?.user) {
        if (!isAuthenticated) {
          set({ isLoading: true });
        }
        supabase
          .from('ku_users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              set({ user: data as User, isAuthenticated: true, isLoading: false });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  }
}));
