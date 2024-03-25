import { useNavigate, NavLink } from "react-router-dom";

import { signOutUser } from "../../utils/firebase/firebase.utils";
import DashboardUser from "../dashboard-user/dashboard-user.component";

import "./dashboard-menu.styles.scss";

const DashboardMenu = ({ displayName, email, photoURL, ...otherProps }) => {
	const navigate = useNavigate();

	const onSignOutUserHandler = async () => {
		await signOutUser().then(() => {
			navigate("/");
		});
	};
	return (
		<aside {...otherProps}>
			<DashboardUser displayName={displayName} email={email} photoURL={photoURL} />
			<div className="nav-tabs">
				<NavLink to={"/dashboard"} activeclassname="active">
					Dashboard
				</NavLink>
				<NavLink to={"history"} activeclassname="active">
					History
				</NavLink>
				<NavLink to={"statistics"} activeclassname="active">
					Statistics
				</NavLink>
				<NavLink to={"settings"} activeclassname="active">
					Settings
				</NavLink>
			</div>
			<div className="footer">
				<button type="button" className="sign-out-btn" onClick={onSignOutUserHandler}>
					Sign Out
				</button>
			</div>
		</aside>
	);
};

export default DashboardMenu;
