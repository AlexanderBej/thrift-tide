import { combineReducers } from "@reduxjs/toolkit";
import { userReducer } from "./user/user.slice";
import { userDocumentReducer } from "./user-document/user-document.slice";

export const rootReducer = combineReducers({
	user: userReducer,
	userDocument: userDocumentReducer
});
