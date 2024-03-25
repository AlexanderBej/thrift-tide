import { Fragment } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import { selectUserDocument } from "../../store/user-document/user-document.selector";

import DashboardMenu from "../../components/dashboard-menu/dashboard-menu.component";

import "./dashboard.styles.scss";

const Dashboard = () => {
	const userDocument = useSelector(selectUserDocument);

	const { displayName, email, photoURL } = userDocument;

	return (
		<main className="dashboard">
			{userDocument && (
				<Fragment>
					<DashboardMenu className="dashboard-menu dashboard-item" displayName={displayName} email={email} photoURL={photoURL} />
					<Outlet />
				</Fragment>
			)}
		</main>
	);
};

export default Dashboard;
