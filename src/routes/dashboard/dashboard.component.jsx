import { Fragment } from "react";
import { useSelector } from "react-redux";

// import { selectUserFinStat } from "../../store/user-financial-status/user-financial-status.selector";
import { selectUserDocument } from "../../store/user-document/user-document.selector";

import DashboardMenu from "../../components/dashboard-menu/dashboard-menu.component";
import CategoryBox from "../../components/category-box/category-box.component";
import DashboardInfo from "../../components/dashboard-info/dashboard-info.component";

import "./dashboard.styles.scss";

const Dashboard = () => {
	// const userFinancialStatus = useSelector(selectUserFinStat);
	const userDocument = useSelector(selectUserDocument);

	// console.log(userFinancialStatus);
	console.log("user doc", userDocument);

	const { financialStatus, displayName, email, photoURL } = userDocument;

	return (
		<main className="dashboard">
			{userDocument && (
				<Fragment>
					<DashboardMenu displayName={displayName} email={email} photoURL={photoURL} />
					<div className="main-side">
						<div className="top">
							<DashboardInfo userDocument={userDocument} />
						</div>
						<div className="bottom">
							<CategoryBox category={financialStatus.expenses.needs} />
							<CategoryBox category={financialStatus.expenses.wants} />
							<CategoryBox category={financialStatus.expenses.save} />
						</div>
					</div>
				</Fragment>
			)}
		</main>
	);
};

export default Dashboard;
