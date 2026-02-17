'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { UserPreferences, ThemeConfig, PokemonTag, CustomList } from '@/types/userPreferences';

interface PreferencesContextValue {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  // Theme actions
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  
  // Tag actions
  addTag: (tag: Omit<PokemonTag, 'id' | 'createdAt'>) => void;
  updateTag: (tagId: string, updates: Partial<PokemonTag>) => void;
  deleteTag: (tagId: string) => void;
  
  // Note actions
  saveNote: (pokemonId: number, content: string) => void;
  deleteNote: (pokemonId: number) => void;
  
  // Favorite actions
  toggleFavorite: (pokemonId: number) => void;
  isFavorite: (pokemonId: number) => boolean;
  
  // Custom list actions
  addCustomList: (list: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomList: (listId: string, updates: Partial<CustomList>) => void;
  deleteCustomList: (listId: string) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const {
    preferences,
    isLoading,
    error,
    updateTheme,
    addTag,
    updateTag,
    deleteTag,
    saveNote,
    deleteNote,
    toggleFavorite,
    addCustomList,
    updateCustomList,
    deleteCustomList,
  } = useUserPreferences();

  const isFavorite = (pokemonId: number): boolean => {
    return preferences?.favorites.includes(pokemonId) ?? false;
  };

  const value: PreferencesContextValue = {
    preferences,
    isLoading,
    error,
    updateTheme,
    addTag,
    updateTag,
    deleteTag,
    saveNote,
    deleteNote,
    toggleFavorite,
    isFavorite,
    addCustomList,
    updateCustomList,
    deleteCustomList,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
