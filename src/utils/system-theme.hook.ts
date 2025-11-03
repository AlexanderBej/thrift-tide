import { useEffect, useState } from 'react';

import { Theme } from '../api/types/settings.types';

export function useSystemTheme(): Theme {
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    // Listener for changes
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // Some browsers still use addListener/removeListener for compatibility
    media.addEventListener
      ? media.addEventListener('change', listener)
      : media.addListener(listener);

    return () => {
      media.removeEventListener
        ? media.removeEventListener('change', listener)
        : media.removeListener(listener);
    };
  }, []);

  return systemTheme;
}
