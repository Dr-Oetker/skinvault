import { create } from 'zustand';
import { supabase } from '../supabaseClient';

interface FavoritesState {
  favoriteSkinIds: string[];
  loading: boolean;
  fetchFavorites: (userId: string) => Promise<void>;
  addFavorite: (userId: string, skinId: string) => Promise<void>;
  removeFavorite: (userId: string, skinId: string) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  favoriteSkinIds: [],
  loading: false,

  fetchFavorites: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('user_favorites')
      .select('skin_id')
      .eq('user_id', userId);
    if (!error && data) {
      set({ favoriteSkinIds: data.map((row: any) => row.skin_id), loading: false });
    } else {
      set({ favoriteSkinIds: [], loading: false });
    }
  },

  addFavorite: async (userId, skinId) => {
    set({ loading: true });
    const { error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: userId, skin_id: skinId }]);
    if (!error) {
      set({ favoriteSkinIds: [...get().favoriteSkinIds, skinId], loading: false });
    } else {
      set({ loading: false });
    }
  },

  removeFavorite: async (userId, skinId) => {
    set({ loading: true });
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('skin_id', skinId);
    if (!error) {
      set({ favoriteSkinIds: get().favoriteSkinIds.filter(id => id !== skinId), loading: false });
    } else {
      set({ loading: false });
    }
  },

  clearFavorites: () => {
    set({ favoriteSkinIds: [], loading: false });
  },
})); 