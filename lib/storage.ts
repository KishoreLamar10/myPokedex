import type { UserPreferences } from '@/types/userPreferences';
import { DEFAULT_PREFERENCES } from '@/types/userPreferences';

const STORAGE_KEY = 'pokedex_preferences';
const STORAGE_VERSION = 1;

/**
 * Storage manager for user preferences
 * Uses localStorage for preferences and IndexedDB for large data
 */
export class StorageManager {
    private static instance: StorageManager;

    private constructor() { }

    static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * Load user preferences from localStorage
     */
    async loadPreferences(): Promise<UserPreferences> {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return { ...DEFAULT_PREFERENCES };
            }

            const parsed: UserPreferences = JSON.parse(stored);

            // Check if migration is needed
            if (parsed.version < STORAGE_VERSION) {
                return this.migratePreferences(parsed);
            }

            return parsed;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return { ...DEFAULT_PREFERENCES };
        }
    }

    /**
     * Save user preferences to localStorage
     */
    async savePreferences(preferences: UserPreferences): Promise<void> {
        try {
            preferences.lastUpdated = Date.now();
            preferences.version = STORAGE_VERSION;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
            throw error;
        }
    }

    /**
     * Clear all stored preferences
     */
    async clearPreferences(): Promise<void> {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear preferences:', error);
            throw error;
        }
    }

    /**
     * Export preferences as JSON
     */
    async exportPreferences(): Promise<string> {
        const preferences = await this.loadPreferences();
        return JSON.stringify(preferences, null, 2);
    }

    /**
     * Import preferences from JSON
     */
    async importPreferences(json: string): Promise<void> {
        try {
            const preferences: UserPreferences = JSON.parse(json);

            // Validate structure
            if (!preferences.version || !preferences.theme) {
                throw new Error('Invalid preferences format');
            }

            await this.savePreferences(preferences);
        } catch (error) {
            console.error('Failed to import preferences:', error);
            throw error;
        }
    }

    /**
     * Migrate preferences from old version to new version
     */
    private migratePreferences(old: UserPreferences): UserPreferences {
        // For now, just merge with defaults
        // In the future, add version-specific migrations here
        return {
            ...DEFAULT_PREFERENCES,
            ...old,
            version: STORAGE_VERSION,
        };
    }

    /**
     * Get storage usage info
     */
    getStorageInfo(): { used: number; available: number } {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const used = stored ? new Blob([stored]).size : 0;

            // localStorage typically has 5-10MB limit
            const available = 5 * 1024 * 1024; // 5MB estimate

            return { used, available };
        } catch {
            return { used: 0, available: 0 };
        }
    }
}

// Export singleton instance
export const storage = StorageManager.getInstance();
