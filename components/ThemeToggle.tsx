'use client';

import { usePreferences } from '@/contexts/PreferencesContext';

export function ThemeToggle() {
  const { preferences, updateTheme } = usePreferences();

  if (!preferences) return null;

  const toggleTheme = () => {
    updateTheme({
      ...preferences.theme,
      mode: preferences.theme.mode === 'dark' ? 'light' : 'dark',
    });
  };

  const isDark = preferences.theme.mode === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <span className="text-xl">☀️</span>
      ) : (
        <span className="text-xl">🌙</span>
      )}
    </button>
  );
}
