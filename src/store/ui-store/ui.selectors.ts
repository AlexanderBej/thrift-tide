import { RootState } from '../store';

export const selectUIDrawerOpen = (s: RootState) => s.ui.drawerOpen;
