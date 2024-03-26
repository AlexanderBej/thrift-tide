import { Fragment } from "react";
import { useSelector } from "react-redux";

import { selectUserDocument } from "../../store/user-document/user-document.selector";

import DashboardInfo from "../../components/dashboard-info/dashboard-info.component";
import CategoryBox from "../../components/category-box/category-box.component";

import "./dashboard-data.styles.scss";
import MobileDashboardData from "../../components/mobile-dashboard-data/mobile-dashboard-data.component";

const DashboardData = () => {
	const userDocument = useSelector(selectUserDocument);

	const { financialStatus } = userDocument;

	return (
		<Fragment>
			<DashboardInfo className="dashboard-info dashboard-item" userDocument={userDocument} />
			<CategoryBox
				className="category-box needs-box dashboard-item"
				categoryList={financialStatus.expenses.needs.expenses}
				categoryTitle={financialStatus.expenses.needs.title}
				type={"expense"}
			/>
			<CategoryBox
				className="category-box wants-box dashboard-item"
				categoryList={financialStatus.expenses.wants.expenses}
				categoryTitle={financialStatus.expenses.wants.title}
				type={"expense"}
			/>
			<CategoryBox
				className="category-box save-box dashboard-item"
				categoryList={financialStatus.expenses.save.expenses}
				categoryTitle={financialStatus.expenses.save.title}
				type={"expense"}
			/>
			<div className="mobile-view dashboard-item">
				<MobileDashboardData financialStatus={financialStatus} userDocument={userDocument} />
			</div>
		</Fragment>
	);
};

export default DashboardData;
