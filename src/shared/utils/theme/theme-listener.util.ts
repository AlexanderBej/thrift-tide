import { store } from '@store/store';
import { onThemeChanged } from './theme.util';

export function watchThemeChanges() {
  let lastTheme: string | null = null;

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const theme = state.settings.theme;
    if (theme && theme !== lastTheme) {
      onThemeChanged(theme);
      lastTheme = theme;
    }
  });

  return unsubscribe;
}
