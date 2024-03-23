import { combineReducers } from "@reduxjs/toolkit";
import { userReducer } from "./user/user.slice";
import { userFiancialStatusReducer } from "./user-financial-status/user-financial-status.slice";
import { userDocumentReducer } from "./user-document/user-document.slice";

export const rootReducer = combineReducers({
	user: userReducer,
	userFinancialStatus: userFiancialStatusReducer,
	userDocument: userDocumentReducer
});
