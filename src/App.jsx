import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import { onAuthStateChangedListener, createUserDocumentFromAuth } from "./utils/firebase/firebase.utils";
import { setCurrentUser } from "./store/user/user.slice";

import Home from "./routes/home/home.component";
import LoginPage from "./routes/login-page/login-page.component";
import NotFound from "./routes/not-found/not-found.component";
import SignUp from "./routes/sign-up/sign-up.component";
import Dashboard from "./routes/dashboard/dashboard.component";

import "./App.scss";

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		const unsubscribe = onAuthStateChangedListener((user) => {
			if (user) {
				createUserDocumentFromAuth(user);
			}
			console.log(setCurrentUser(user));
			dispatch(setCurrentUser(user));
		});
		return unsubscribe;
	}, [dispatch]);
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
