import { Theme } from '../api/types/settings.types';

const LINK_ID = 'tt-theme';
const HREF = (t: Theme) => `${process.env.PUBLIC_URL}/${t}.css`;

export function applyTheme(theme: Theme) {
  const el = ensureThemeLink();
  if (el) el.href = HREF(theme);
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
  console.log('init theme', saved);

  if (saved) return onThemeChanged(saved);
  // fallback to OS
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  console.log('init theme prefersDark', prefersDark);

  onThemeChanged(prefersDark ? 'dark' : 'light');
}

function ensureThemeLink(): HTMLLinkElement {
  let el = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.id = LINK_ID;
    el.rel = 'stylesheet';
    // optional: preload for faster swap
    // el.as = 'style';
    document.head.appendChild(el);
  }
  return el;
}
