import { Fragment } from "react";
import { useSelector } from "react-redux";

import { selectUserDocument } from "../../store/user-document/user-document.selector";

import DashboardMenu from "../../components/dashboard-menu/dashboard-menu.component";
import CategoryBox from "../../components/category-box/category-box.component";
import DashboardInfo from "../../components/dashboard-info/dashboard-info.component";

import "./dashboard.styles.scss";

const Dashboard = () => {
	const userDocument = useSelector(selectUserDocument);

	const { financialStatus, displayName, email, photoURL } = userDocument;

	return (
		<main className="dashboard">
			{userDocument && (
				<Fragment>
					{/*<DashboardMenu className="dahs-men" displayName={displayName} email={email} photoURL={photoURL} />
					<div className="main-side">
						<div className="top">
							<DashboardInfo userDocument={userDocument} />
						</div>
						<div className="bottom">
							<CategoryBox category={financialStatus.expenses.needs} />
							<CategoryBox category={financialStatus.expenses.wants} />
							<CategoryBox category={financialStatus.expenses.save} />
						</div>
			</div>*/}
					<DashboardMenu className="dashboard-menu dashboard-item" displayName={displayName} email={email} photoURL={photoURL} />
					<DashboardInfo className="dashboard-info dashboard-item" userDocument={userDocument} />
					<CategoryBox className="category-box needs-box dashboard-item" category={financialStatus.expenses.needs} />
					<CategoryBox className="category-box wants-box dashboard-item" category={financialStatus.expenses.wants} />
					<CategoryBox className="category-box save-box dashboard-item" category={financialStatus.expenses.save} />
				</Fragment>
			)}
		</main>
	);
};

export default Dashboard;
