import { useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../store/user/user.selector";

import TransactionBox from "../transaction-box/transaction-box.component";
import AddIncomeModal from "../add-income-modal/add-income-modal.component";
import AddExpenseModal from "../add-expense-modal/add-expense-modal.component";

import "./dashboard-info.styles.scss";

const DashboardInfo = ({ userDocument, ...otherProps }) => {
	const currentUser = useSelector(selectCurrentUser);
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
						{financialStatus.income.total}
					</h2>
					<h2 className="fin-status-header" name="Expenses">
						{financialStatus.expenses.total}
					</h2>
					<h2 className="fin-status-header" name="Remaining">
						{financialStatus.remaining}
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
				/>
				<AddExpenseModal
					isAddExpenseModalOpen={isAddExpenseModalOpen}
					onAddExpenseModalClose={closeAddExpenseModal}
					financialStatus={financialStatus}
					currentUser={currentUser}
					userDocument={userDocument}
				/>
			</section>
		</div>
	);
};

export default DashboardInfo;
