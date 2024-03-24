import { createSlice } from "@reduxjs/toolkit";

const USER_DOCUMENT_INITIAL_STATE = {
	userDocument: {
		financialStatus: {
			income: {
				total: 0,
				incomes: [],
			},
			expenses: {
				total: 0,
				needs: [],
				wants: [],
				save: [],
			},
		},
	},
};

export const userDocumentSlice = createSlice({
	name: "user-doc",
	initialState: USER_DOCUMENT_INITIAL_STATE,
	reducers: {
		setUserDocument(state, action) {
			state.userDocument = action.payload;
		},
	},
});

export const { setUserDocument } = userDocumentSlice.actions;

export const userDocumentReducer = userDocumentSlice.reducer;
