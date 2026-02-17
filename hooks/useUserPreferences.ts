'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserPreferences, ThemeConfig, PokemonTag, PokemonNote, CustomList } from '@/types/userPreferences';
import { storage } from '@/lib/storage';

export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Load preferences on mount
    useEffect(() => {
        async function load() {
            try {
                const prefs = await storage.loadPreferences();
                setPreferences(prefs);
                setError(null);
            } catch (err) {
                setError('Failed to load preferences');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    // Debounced save function
    const debouncedSave = useCallback((prefs: UserPreferences) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await storage.savePreferences(prefs);
            } catch (err) {
                console.error('Failed to save preferences:', err);
                setError('Failed to save preferences');
            }
        }, 500); // 500ms debounce
    }, []);

    // Update preferences (optimistic + debounced save)
    const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    // Theme actions
    const updateTheme = useCallback((theme: Partial<ThemeConfig>) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                theme: { ...prev.theme, ...theme },
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    // Tag actions
    const addTag = useCallback((tag: Omit<PokemonTag, 'id' | 'createdAt'>) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const newTag: PokemonTag = {
                ...tag,
                id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now(),
            };
            const updated = {
                ...prev,
                tags: [...prev.tags, newTag],
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    const updateTag = useCallback((tagId: string, updates: Partial<PokemonTag>) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                tags: prev.tags.map((tag) =>
                    tag.id === tagId ? { ...tag, ...updates } : tag
                ),
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    const deleteTag = useCallback((tagId: string) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                tags: prev.tags.filter((tag) => tag.id !== tagId),
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    // Note actions
    const saveNote = useCallback((pokemonId: number, content: string) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                notes: {
                    ...prev.notes,
                    [pokemonId]: {
                        pokemonId,
                        content,
                        updatedAt: Date.now(),
                    },
                },
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    const deleteNote = useCallback((pokemonId: number) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const { [pokemonId]: _, ...remainingNotes } = prev.notes;
            const updated = {
                ...prev,
                notes: remainingNotes,
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    // Favorite actions
    const toggleFavorite = useCallback((pokemonId: number) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const isFavorite = prev.favorites.includes(pokemonId);
            const updated = {
                ...prev,
                favorites: isFavorite
                    ? prev.favorites.filter((id) => id !== pokemonId)
                    : [...prev.favorites, pokemonId],
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    // Custom list actions
    const addCustomList = useCallback((list: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt'>) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const newList: CustomList = {
                ...list,
                id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            const updated = {
                ...prev,
                customLists: [...prev.customLists, newList],
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    const updateCustomList = useCallback((listId: string, updates: Partial<CustomList>) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                customLists: prev.customLists.map((list) =>
                    list.id === listId ? { ...list, ...updates, updatedAt: Date.now() } : list
                ),
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    const deleteCustomList = useCallback((listId: string) => {
        setPreferences((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                customLists: prev.customLists.filter((list) => list.id !== listId),
            };
            debouncedSave(updated);
            return updated;
        });
    }, [debouncedSave]);

    return {
        preferences,
        isLoading,
        error,
        updatePreferences,
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
    };
}
