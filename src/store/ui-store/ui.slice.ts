import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  drawerOpen: boolean;
}

const initialState: UIState = {
  drawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    drawerOpen: (s) => {
      s.drawerOpen = true;
    },
    drawerClose: (s) => {
      s.drawerOpen = false;
    },
    drawerToggle: (s) => {
      s.drawerOpen = !s.drawerOpen;
    },
  },
});

export const { drawerOpen, drawerClose, drawerToggle } = uiSlice.actions;
export default uiSlice.reducer;
