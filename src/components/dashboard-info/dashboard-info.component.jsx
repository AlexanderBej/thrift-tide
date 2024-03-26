import { useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../store/user/user.selector";
import { selectCurrency } from "../../store/currency/currency.selector";

import TransactionBox from "../transaction-box/transaction-box.component";
import AddIncomeModal from "../add-income-modal/add-income-modal.component";
import AddExpenseModal from "../add-expense-modal/add-expense-modal.component";

import "./dashboard-info.styles.scss";

const DashboardInfo = ({ userDocument, ...otherProps }) => {
	const currentUser = useSelector(selectCurrentUser);
	const selectedCurrency = useSelector(selectCurrency);
	const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
	const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

	const { financialStatus } = userDocument;

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // JavaScript months are zero-based, so add 1

	const handleAddIncomeModalOpenClick = () => {
		setIsAddIncomeModalOpen(!isAddIncomeModalOpen);
	};

	const handleAddExpenseModalOpenClick = () => {
		setIsAddExpenseModalOpen(!isAddExpenseModalOpen);
	};

	const closeAddIncomeModal = () => {
		setIsAddIncomeModalOpen(false);
	};

	const closeAddExpenseModal = () => {
		setIsAddExpenseModalOpen(false);
	};

	const isCurrencyRON = (currentCurrency) => {
		if (currentCurrency === "RON") return true;
		return false;
	};

	return (
		<div {...otherProps}>
			<div className="info-container">
				<div className="income-container">
					<span>Incomes</span>
					<div className="incomes-list">
						{financialStatus.income.incomes
							.filter((income) => {
								const [month] = income.addedAt.date.split("/");
								return parseInt(month, 10) === currentMonth;
							})
							.map((income) => {
								return <TransactionBox key={income.id} date={income.addedAt} text={income.from} amount={income.amount} />;
							})}
					</div>
				</div>
				<div className="other-fin-info">
					<h2 className="fin-status-header" name="Income">
						{!isCurrencyRON(selectedCurrency.currency) && <span className="currency">{selectedCurrency.currency} </span>}
						{financialStatus.income.total}
						{isCurrencyRON(selectedCurrency.currency) && <span className="currency"> {selectedCurrency.currency}</span>}
					</h2>
					<h2 className="fin-status-header" name="Expenses">
						{!isCurrencyRON(selectedCurrency.currency) && <span className="currency">{selectedCurrency.currency} </span>}
						{financialStatus.expenses.total}
						{isCurrencyRON(selectedCurrency.currency) && <span className="currency"> {selectedCurrency.currency}</span>}
					</h2>
					<h2 className="fin-status-header" name="Remaining">
						{!isCurrencyRON(selectedCurrency.currency) && <span className="currency">{selectedCurrency.currency} </span>}
						{financialStatus.remaining}
						{isCurrencyRON(selectedCurrency.currency) && <span className="currency"> {selectedCurrency.currency}</span>}
					</h2>
				</div>
				<div className="transaction-btns">
					<button className="transaction-btn add-income-btn" type="button" onClick={handleAddIncomeModalOpenClick}>
						+
					</button>
					<button className="transaction-btn add-transaction-btn" type="button" onClick={handleAddExpenseModalOpenClick}>
						--
					</button>
				</div>
			</div>
			<section>
				<AddIncomeModal
					isAddIncomeModalOpen={isAddIncomeModalOpen}
					onAddIncomeModalClose={closeAddIncomeModal}
					financialStatus={financialStatus}
					currentUser={currentUser}
					userDocument={userDocument}
					currency={selectedCurrency.currency}
				/>
				<AddExpenseModal
					isAddExpenseModalOpen={isAddExpenseModalOpen}
					onAddExpenseModalClose={closeAddExpenseModal}
					financialStatus={financialStatus}
					currentUser={currentUser}
					userDocument={userDocument}
					currency={selectedCurrency.currency}
				/>
			</section>
		</div>
	);
};

export default DashboardInfo;
