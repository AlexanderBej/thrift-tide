import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../store/user/user.selector";
import "./dashboard.styles.scss";

const Dashboard = () => {
	const currentUser = useSelector(selectCurrentUser)
	console.log(currentUser)

	return (
		<main className="dashboard">
			<div className="navigation-side"></div>
			<div className="main-side">
				<div className="top"></div>
				<div className="bottom"></div>
			</div>
		</main>
	);
};

export default Dashboard;
