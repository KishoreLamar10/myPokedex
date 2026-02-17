'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { applyTheme } from '@/lib/themes';

export function ThemeApplier() {
  const { preferences } = usePreferences();

  useEffect(() => {
    if (preferences) {
      applyTheme(preferences.theme);
    }
  }, [preferences]);

  return null;
}
