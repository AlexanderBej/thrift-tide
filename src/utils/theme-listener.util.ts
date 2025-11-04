import { store } from '../store/store';
import { onThemeChanged } from './theme.util';

export function watchThemeChanges() {
  let lastTheme: string | null = null;

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const theme = state.settings.theme;
    console.log('in watch theme', theme);
    if (theme && theme !== lastTheme) {
      console.log('TIME TO GO', theme);

      onThemeChanged(theme);
      lastTheme = theme;
    }
  });

  return unsubscribe;
}
