import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { onAuthStateChangedListener, createUserDocumentFromAuth } from "./utils/firebase/firebase.utils";
import { setCurrentUser } from "./store/user/user.slice";
import { selectCurrentUser } from "./store/user/user.selector";
import { getUserDocument } from "./utils/firebase/firebase.utils";
// import { setUserFinancialStatus } from "./store/user-financial-status/user-financial-status.slice";

import Home from "./routes/home/home.component";
import LoginPage from "./routes/login-page/login-page.component";
import NotFound from "./routes/not-found/not-found.component";
import SignUp from "./routes/sign-up/sign-up.component";
import Dashboard from "./routes/dashboard/dashboard.component";

import "./App.scss";
import { setUserDocument } from "./store/user-document/user-document.slice";

function App() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = onAuthStateChangedListener(async (user) => {
			console.log("in unsubscribe", user)
			if (user) {
				await createUserDocumentFromAuth(user);
				const getUserFinancialStatus = async () => {
					const userFinancialStatusGot = await getUserDocument(user);
					console.log("what do we got", userFinancialStatusGot)
					// setFinancialStatus(categoriesArray.financialStatus);
					// dispatch(setUserFinancialStatus(userFinancialStatusGot.financialStatus));
					dispatch(setUserDocument(userFinancialStatusGot))
					// const { nameToDisplay, email } = userFinancialStatusGot.financialStatus;
					// setUserData({ displayName: nameToDisplay, email, photoURL: "" });
				};
				getUserFinancialStatus();
				navigate("/dashboard");
			}
			dispatch(setCurrentUser(user));
		});
		return unsubscribe;
	}, [dispatch, navigate]);

	// const currentUser = useSelector(selectCurrentUser);
	// useEffect(() => {
	// 	if (currentUser) {
	// 		const getUserFinancialStatus = async () => {
	// 			const userFinancialStatusGot = await getUserDocument(currentUser);
	// 			dispatch(setUserFinancialStatus(userFinancialStatusGot.financialStatus));
	// 		};
	// 		getUserFinancialStatus();
	// 		navigate("/dashboard");
	// 	}
	// }, [currentUser, dispatch, navigate]);

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="login" element={<LoginPage />} />
			<Route path="sign-up" element={<SignUp />} />
			<Route path="dashboard" element={<Dashboard />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;
