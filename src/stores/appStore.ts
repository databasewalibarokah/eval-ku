import { create } from 'zustand';
import { User, Daerah, Settings, Tes, Peserta, HasilTes } from '../types';
import { supabase, adminAuthClient } from '../lib/supabase';

interface AppState {
  users: User[];
  daerah: Daerah[];
  settings: Settings[]; // Changed since settings is array now
  tes: Tes[];
  peserta: Peserta[];
  hasilTes: HasilTes[];

  initStore: () => Promise<void>;
  
  addUser: (user: Omit<User, 'id' | 'created_at'>, password?: string) => Promise<{success: boolean, error?: string}>;
  updateUser: (id: string, updates: Partial<User>, password?: string) => Promise<{success: boolean, error?: string}>;
  
  addDaerah: (daerah: Omit<Daerah, 'id' | 'created_at'>) => Promise<void>;
  updateDaerah: (id: string, updates: Partial<Daerah>) => Promise<void>;
  deleteDaerah: (id: string) => Promise<void>;
  
  updateSettings: (tipe: 'evaluasi' | 'seleksi', fields: Settings['metadata_fields']) => Promise<void>;
  
  addTes: (tes: Omit<Tes, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTes: (id: string, updates: Partial<Tes>) => Promise<void>;
  deleteTes: (id: string) => Promise<void>;
  
  addPeserta: (peserta: Omit<Peserta, 'id' | 'created_at'>) => Promise<Peserta | null>;
  updatePeserta: (id: string, updates: Partial<Peserta>) => Promise<void>;
  deletePeserta: (id: string) => Promise<void>;
  
  addHasilTes: (hasil: Omit<HasilTes, 'id'>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: [],
  daerah: [],
  settings: [],
  tes: [],
  peserta: [],
  hasilTes: [],

  initStore: async () => {
    // Fetch all initial data
    const [
      { data: users }, 
      { data: daerah }, 
      { data: settings }, 
      { data: tes }, 
      { data: peserta }, 
      { data: hasilTes }
    ] = await Promise.all([
      supabase.from('ku_users').select('*'),
      supabase.from('ku_daerah').select('*'),
      supabase.from('ku_settings').select('*'),
      supabase.from('ku_tes').select('*'),
      supabase.from('ku_peserta').select('*'),
      supabase.from('ku_hasil_tes').select('*')
    ]);

    set({
      users: (users || []) as User[],
      daerah: (daerah || []) as Daerah[],
      settings: (settings || []) as Settings[],
      tes: (tes || []) as Tes[],
      peserta: (peserta || []) as Peserta[],
      hasilTes: (hasilTes || []) as HasilTes[],
    });
  },

  addUser: async (u, password) => {
    // 1. Create Auth User using alt client so we don't log out the admin
    // Note: Since "Confirm Email" is disabled, this will be verified immediately.
    const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
      email: u.email,
      password: password || '12345678',
    });

    if (authError) {
      console.error('Error creating auth user:', authError.message);
      return { success: false, error: authError.message };
    }

    if (!authData.user) return { success: false, error: 'User tidak ditemukan setelah register' };

    // 2. Insert into public.ku_users
    const { data, error } = await supabase.from('ku_users').insert([{
      ...u,
      id: authData.user.id
    }]).select().single();

    if (error) {
      console.error('Error saving user data:', error.message);
      return { success: false, error: error.message };
    }

    if (data) {
      set({ users: [...get().users, data as User] });
      return { success: true };
    }
    return { success: false, error: 'Unknown error' };
  },

  updateUser: async (id, updates, password) => {
    // 1. Update Supabase Auth if email or password provided
    // This requires Admin API (Service Role Key) to update OTHER users.
    // If using anon key, this will fail unless the user is updating themselves.
    if (updates.email || password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email: updates.email,
        password: password
      });
      
      if (authError) {
        console.error('Error updating auth user:', authError.message);
        // We won't block the UI if this fails, because we know it will fail without service key,
        // but we'll return the error just in case.
        return { success: false, error: 'Gagal update kredensial: ' + authError.message };
      }
    }

    // 2. Update public.ku_users
    const { data, error } = await supabase.from('ku_users').update(updates).eq('id', id).select().single();
    if (error) {
       return { success: false, error: error.message };
    }
    if (data) {
      set({ users: get().users.map(u => u.id === id ? (data as User) : u) });
      return { success: true };
    }
    return { success: false, error: 'Unknown error' };
  },

  addDaerah: async (d) => {
    const { data, error } = await supabase.from('ku_daerah').insert([d]).select().single();
    if (data && !error) {
      set({ daerah: [...get().daerah, data as Daerah] });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  updateDaerah: async (id, updates) => {
    const { data, error } = await supabase.from('ku_daerah').update(updates).eq('id', id).select().single();
    if (data && !error) {
      set({ daerah: get().daerah.map(d => d.id === id ? (data as Daerah) : d) });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  deleteDaerah: async (id) => {
    const { error } = await supabase.from('ku_daerah').delete().eq('id', id);
    if (!error) {
      set({ daerah: get().daerah.filter(d => d.id !== id) });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  updateSettings: async (tipe, fields) => {
    const { data, error } = await supabase.from('ku_settings').update({ metadata_fields: fields }).eq('tipe', tipe).select().single();
    if (data && !error) {
      set({ settings: get().settings.map(s => s.tipe === tipe ? (data as Settings) : s) });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  addTes: async (t) => {
    const { data, error } = await supabase.from('ku_tes').insert([t]).select().single();
    if (data && !error) {
      set({ tes: [...get().tes, data as Tes] });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  updateTes: async (id, updates) => {
    const { data, error } = await supabase.from('ku_tes').update(updates).eq('id', id).select().single();
    if (data && !error) {
      set({ tes: get().tes.map(t => t.id === id ? (data as Tes) : t) });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  deleteTes: async (id) => {
    const { error } = await supabase.from('ku_tes').delete().eq('id', id);
    if (!error) {
      set({ tes: get().tes.filter(t => t.id !== id) });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  addPeserta: async (p) => {
    const { data, error } = await supabase.from('ku_peserta').insert([p]).select().single();
    if (data && !error) {
      set({ peserta: [...get().peserta, data as Peserta] });
      return data as Peserta;
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
    return null;
  },

  updatePeserta: async (id, updates) => {
    const { data, error } = await supabase.from('ku_peserta').update(updates).eq('id', id).select().single();
    if (data && !error) {
      set({ peserta: get().peserta.map(p => p.id === id ? (data as Peserta) : p) });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  deletePeserta: async (id) => {
    // Delete related hasil tes first
    await supabase.from('ku_hasil_tes').delete().eq('peserta_id', id);
    const { error } = await supabase.from('ku_peserta').delete().eq('id', id);
    if (!error) {
      set({ 
        peserta: get().peserta.filter(p => p.id !== id),
        hasilTes: get().hasilTes.filter(h => h.peserta_id !== id)
      });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },

  addHasilTes: async (h) => {
    const { data, error } = await supabase.from('ku_hasil_tes').insert([h]).select().single();
    if (data && !error) {
      set({ hasilTes: [...get().hasilTes, data as HasilTes] });
    } else {
      // TODO: Add proper error handling and UI notifications for Supabase failures
      await get().initStore();
    }
  },
}));

