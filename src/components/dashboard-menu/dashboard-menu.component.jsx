import { useNavigate, useLocation, Link } from "react-router-dom";

import { signOutUser } from "../../utils/firebase/firebase.utils";
import DashboardUser from "../dashboard-user/dashboard-user.component";
import { ReactComponent as Logo } from "../../assets/Logo.svg";

import "./dashboard-menu.styles.scss";

const DashboardMenu = ({ displayName, email, photoURL, ...otherProps }) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const onSignOutUserHandler = async () => {
		await signOutUser().then(() => {
			navigate("/");
		});
	};

	const isLocationActive = (location) => {
		if (pathname === location) return true;
		return false;
	};

	return (
		<aside {...otherProps}>
			<Logo className="logo" />
			<DashboardUser displayName={displayName} email={email} photoURL={photoURL} />
			<div className="nav-tabs">
				<Link className={isLocationActive("/dashboard") ? "active" : ""} to="/dashboard">
					Dashboard
				</Link>
				<Link className={isLocationActive("/dashboard/history") ? "active" : ""} to="history">
					History
				</Link>
				<Link className={isLocationActive("/dashboard/statistics") ? "active" : ""} to="statistics">
					Statistics
				</Link>
				<Link className={isLocationActive("/dashboard/settings") ? "active" : ""} to="settings">
					Settings
				</Link>
			</div>
			<div className="menu-btn">
				<button>Menu</button>
			</div>
			<div className="footer">
				<button type="button" className="underlined-btn" onClick={onSignOutUserHandler}>
					Sign Out
				</button>
			</div>
		</aside>
	);
};

export default DashboardMenu;
