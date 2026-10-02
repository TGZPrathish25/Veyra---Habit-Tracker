/** Hook to toggle dark/light theme. */
import { useThemeStore } from '@/store/themeStore';

export function useTheme() {
  return useThemeStore();
}
