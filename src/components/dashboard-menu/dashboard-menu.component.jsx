import { useNavigate } from "react-router-dom";

import { signOutUser } from "../../utils/firebase/firebase.utils";
import DashboardUser from "../dashboard-user/dashboard-user.component";

import "./dashboard-menu.styles.scss";

const DashboardMenu = ({displayName, email, photoURL}) => {
	const navigate = useNavigate();

	const onSignOutUserHandler = () => {
		signOutUser();
		navigate("/");
	};
	return (
		<div className="dashboard-menu">
			<DashboardUser displayName={displayName} email={email} photoURL={photoURL}/>

			<footer>
				<button type="button" className="sign-out-btn" onClick={onSignOutUserHandler}>
					Sign Out
				</button>
			</footer>
		</div>
	);
};

export default DashboardMenu;
