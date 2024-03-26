import { createSlice } from "@reduxjs/toolkit";

const CURRENCY_INITIAL_STATE = {
	currency: "RON",
};

export const currencySlice = createSlice({
	name: "currency",
	initialState: CURRENCY_INITIAL_STATE,
	reducers: {
		setCurrency(state, action) {
			state.currency = action.payload;
		},
	},
});

export const { setCurrency } = currencySlice.actions;

export const currencyReducer = currencySlice.reducer;
