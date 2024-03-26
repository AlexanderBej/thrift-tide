import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrency } from "../../store/currency/currency.selector";

import FinancialStatusHeader from "../../components/financial-status-header/financial-status-header.component";
import TransactionButtons from "../../components/transaction-buttons/transaction-buttons.component";

import "./mobile-dashboard-data.styles.scss";
import CategoryBox from "../category-box/category-box.component";

const MobileDashboardData = ({ financialStatus, userDocument }) => {
	const [selectedCategory, setSelectedCategory] = useState(financialStatus.expenses.needs.expenses);
	const [selectedHeader, setSelectedHeader] = useState("needs");
	const [categoryType, setCategoryType] = useState("expense");

	useEffect(() => {
		if (financialStatus) {
			if (!selectedCategory) {
				setSelectedCategory(financialStatus.expenses.needs.expenses);
			}
		}
	}, [financialStatus, selectedCategory]);

	const selectedCurrency = useSelector(selectCurrency);

	const onHeaderClickHandler = (category) => {
		setSelectedHeader(category);
		switch (category) {
			case "incomes":
				setSelectedCategory(financialStatus.income.incomes);
				setCategoryType("income");
				break;
			case "needs":
				setSelectedCategory(financialStatus.expenses.needs.expenses);
				setCategoryType("expense");
				break;
			case "wants":
				setSelectedCategory(financialStatus.expenses.wants.expenses);
				setCategoryType("expense");
				break;
			case "savings":
				setSelectedCategory(financialStatus.expenses.save.expenses);
				setCategoryType("expense");
				break;

			default:
				return;
		}
	};

	return (
		<Fragment>
			<div className="financial-statuses">
				<FinancialStatusHeader categoryTotal={financialStatus.income.total} title={"Income"} currency={selectedCurrency.currency} />
				<FinancialStatusHeader categoryTotal={financialStatus.expenses.total} title={"Expenses"} currency={selectedCurrency.currency} />
				<FinancialStatusHeader categoryTotal={financialStatus.remaining} title={"Remaining"} currency={selectedCurrency.currency} />
			</div>
			<div className="categories-list">
				<h1 onClick={() => onHeaderClickHandler("incomes")} className={selectedHeader === "incomes" ? "selected" : ""}>
					Incomes
				</h1>
				<h1 onClick={() => onHeaderClickHandler("needs")} className={selectedHeader === "needs" ? "selected" : ""}>
					Needs
				</h1>
				<h1 onClick={() => onHeaderClickHandler("wants")} className={selectedHeader === "wants" ? "selected" : ""}>
					Wants
				</h1>
				<h1 onClick={() => onHeaderClickHandler("savings")} className={selectedHeader === "savings" ? "selected" : ""}>
					Savings
				</h1>
			</div>

			<div className="mobile-btn-box">
				<TransactionButtons financialStatus={financialStatus} userDocument={userDocument} currency={selectedCurrency.currency} />
			</div>
			<CategoryBox className="mobile-view-categories" categoryList={selectedCategory} type={categoryType} />
		</Fragment>
	);
};

export default MobileDashboardData;
