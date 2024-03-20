import { Routes, Route } from "react-router-dom";

import Home from "./routes/home/home.component";
import LoginPage from "./routes/login-page/login-page.component";
import NotFound from "./routes/not-found/not-found.component";
import SignUp from "./routes/sign-up/sign-up.component";
import Dashboard from "./routes/dashboard/dashboard.component";

import "./App.scss";

function App() {
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
