import { createSlice } from "@reduxjs/toolkit";

export const USER_FINANCIAL_STATUS_INITIAL_STATE = {
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
    }
};

export const userFinancialStatusSlice = createSlice({
    name: 'user-financial-status',
    initialState: USER_FINANCIAL_STATUS_INITIAL_STATE,
    reducers: {
        setUserFinancialStatus(state, action) {
            console.log("here", state, action);
            state.financialStatus = action.payload;
        }
    }
})

export const { setUserFinancialStatus } = userFinancialStatusSlice.actions;

export const userFiancialStatusReducer = userFinancialStatusSlice.reducer;