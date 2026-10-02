/** Zustand theme store — dark/light/ambient/system management with localStorage persistence. */
import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'ambient' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'veyra-theme';

/** Read the saved theme from localStorage, fall back to 'dark'. */
function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'ambient' || saved === 'system') {
      return saved;
    }
  } catch {
    /* localStorage unavailable */
  }
  return 'dark';
}

/** Apply the theme classes to <html>. */
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Remove all theme classes first
  root.classList.remove('dark', 'ambient');

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'ambient') {
    root.classList.add('dark', 'ambient');
  } else if (theme === 'light') {
    // No class needed — light is the base
  } else {
    // system: follow OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark');
  }

  // Persist
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable */
  }
}

// Apply saved theme immediately on store creation (before first render)
const initialTheme = getSavedTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
