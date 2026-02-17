import type { ThemeConfig, PokemonType } from '@/types/userPreferences';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
    accentPrimary: string;
    accentSecondary: string;
    accentHover: string;
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
}

/**
 * Type-based theme presets
 */
export const TYPE_THEME_PRESETS: Record<PokemonType, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
};

/**
 * Generate lighter/darker shades of a color
 */
function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Get theme colors based on mode and accent
 */
export function getThemeColors(theme: ThemeConfig): ThemeColors {
    const { accentColor } = theme;

    // Handle auto mode by detecting system preference
    let mode = theme.mode;
    if (mode === 'auto') {
        mode = getSystemTheme();
    }

    if (mode === 'dark') {
        return {
            accentPrimary: accentColor,
            accentSecondary: adjustColor(accentColor, -20),
            accentHover: adjustColor(accentColor, 20),
            bgPrimary: '#09090b',
            bgSecondary: '#18181b',
            bgTertiary: '#27272a',
            textPrimary: '#fafafa',
            textSecondary: '#e4e4e7',
            textMuted: '#a1a1aa',
            border: '#3f3f46',
            borderLight: '#27272a',
        };
    } else {
        return {
            accentPrimary: accentColor,
            accentSecondary: adjustColor(accentColor, -20),
            accentHover: adjustColor(accentColor, 20),
            bgPrimary: '#ffffff',
            bgSecondary: '#f4f4f5',
            bgTertiary: '#e4e4e7',
            textPrimary: '#18181b',
            textSecondary: '#3f3f46',
            textMuted: '#71717a',
            border: '#d4d4d8',
            borderLight: '#e4e4e7',
        };
    }
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: ThemeConfig): void {
    const colors = getThemeColors(theme);
    const root = document.documentElement;

    // Set CSS variables
    root.style.setProperty('--accent-primary', colors.accentPrimary);
    root.style.setProperty('--accent-secondary', colors.accentSecondary);
    root.style.setProperty('--accent-hover', colors.accentHover);
    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--border-light', colors.borderLight);

    // Set data attribute for mode
    root.setAttribute('data-theme', theme.mode);
}

/**
 * Get default theme
 */
export function getDefaultTheme(): ThemeConfig {
    return {
        mode: 'dark',
        accentColor: '#ef4444', // Red
    };
}

/**
 * Detect system theme preference
 */
export function getSystemTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get type theme preset
 */
export function getTypeThemePreset(type: PokemonType): ThemeConfig {
    return {
        mode: 'dark',
        accentColor: TYPE_THEME_PRESETS[type],
        primaryType: type,
    };
}
