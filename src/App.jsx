import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { onAuthStateChangedListener, createUserDocumentFromAuth } from "./utils/firebase/firebase.utils";
import { setCurrentUser } from "./store/user/user.slice";
import { getUserDocument } from "./utils/firebase/firebase.utils";

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
			if (user) {
				await createUserDocumentFromAuth(user);
				const getUserFinancialStatus = async () => {
					const userFinancialStatusGot = await getUserDocument(user);
					dispatch(setUserDocument(userFinancialStatusGot));
				};
				getUserFinancialStatus();
				navigate("/dashboard");
			}
			dispatch(setCurrentUser(user));
		});
		return unsubscribe;
	}, [dispatch, navigate]);

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
