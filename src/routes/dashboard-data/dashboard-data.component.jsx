import { useSelector } from "react-redux";

import { selectUserDocument } from "../../store/user-document/user-document.selector";

import DashboardInfo from "../../components/dashboard-info/dashboard-info.component";
import CategoryBox from "../../components/category-box/category-box.component";

import "./dashboard-data.styles.scss";
import { Fragment } from "react";

const DashboardData = () => {
	const userDocument = useSelector(selectUserDocument);

	const { financialStatus } = userDocument;

	return (
		<Fragment>
			<DashboardInfo className="dashboard-info dashboard-item" userDocument={userDocument} />
			<CategoryBox className="category-box needs-box dashboard-item" category={financialStatus.expenses.needs} />
			<CategoryBox className="category-box wants-box dashboard-item" category={financialStatus.expenses.wants} />
			<CategoryBox className="category-box save-box dashboard-item" category={financialStatus.expenses.save} />
		</Fragment>
	);
};

export default DashboardData;
