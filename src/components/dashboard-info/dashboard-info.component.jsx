import { useSelector } from "react-redux";

import { selectCurrency } from "../../store/currency/currency.selector";

import TransactionButtons from "../transaction-buttons/transaction-buttons.component";
import FinancialStatusHeader from "../financial-status-header/financial-status-header.component";
import CategoryBox from "../category-box/category-box.component";

import "./dashboard-info.styles.scss";

const DashboardInfo = ({ userDocument, ...otherProps }) => {
	const selectedCurrency = useSelector(selectCurrency);

	const { financialStatus } = userDocument;

	return (
		<div {...otherProps}>
			<div className="info-container">
				<div className="income-container">
					<span>Incomes</span>
					<div className="incomes-list">
						<CategoryBox categoryList={financialStatus.income.incomes} type={"income"}/>
					</div>
				</div>
				<div className="other-fin-info">
					<FinancialStatusHeader categoryTotal={financialStatus.income.total} title={"Income"} currency={selectedCurrency.currency} />
					<FinancialStatusHeader categoryTotal={financialStatus.expenses.total} title={"Expenses"} currency={selectedCurrency.currency} />
					<FinancialStatusHeader categoryTotal={financialStatus.remaining} title={"Remaining"} currency={selectedCurrency.currency} />
				</div>
				<TransactionButtons currency={selectedCurrency.currency} financialStatus={financialStatus} userDocument={userDocument} />
			</div>
		</div>
	);
};

export default DashboardInfo;
