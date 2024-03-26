import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import { onAuthStateChangedListener, createUserDocumentFromAuth } from "./utils/firebase/firebase.utils";
import { setCurrentUser } from "./store/user/user.slice";
import { getUserDocument } from "./utils/firebase/firebase.utils";
import { setUserDocument } from "./store/user-document/user-document.slice";

import Home from "./routes/home/home.component";
import LoginPage from "./routes/login-page/login-page.component";
import NotFound from "./routes/not-found/not-found.component";
import SignUp from "./routes/sign-up/sign-up.component";
import Dashboard from "./routes/dashboard/dashboard.component";
import DashboardData from "./routes/dashboard-data/dashboard-data.component";
import History from "./routes/history/history.component";
import Statistics from "./routes/statistics/statistics.component";
import Settings from "./routes/settings/settings.component";

import "./App.scss";

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		const unsubscribe = onAuthStateChangedListener(async (user) => {
			if (user) {
				await createUserDocumentFromAuth(user);
				const getUserFinancialStatus = async () => {
					const userFinancialStatusGot = await getUserDocument(user);
					dispatch(setUserDocument(userFinancialStatusGot));
				};
				getUserFinancialStatus();
			}
			dispatch(setCurrentUser(user));
		});
		return unsubscribe;
	}, [dispatch]);

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="login" element={<LoginPage />} />
			<Route path="sign-up" element={<SignUp />} />
			<Route path="dashboard" element={<Dashboard />}>
				<Route index element={<DashboardData />} />
				<Route path="history" element={<History />} />
				<Route path="statistics" element={<Statistics />} />
				<Route path="settings" element={<Settings />} />
			</Route>

			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;
