import { Theme } from '@api/types';

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Call this whenever settings.theme changes
export function onThemeChanged(next: Theme) {
  applyTheme(next);
  // keep localStorage ONLY as a boot hint
  localStorage.setItem('theme', next);
}

export function initTheme() {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved) return onThemeChanged(saved);
  // fallback to OS
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  onThemeChanged(prefersDark ? 'dark' : 'light');
}
