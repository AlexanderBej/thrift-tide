import { Fragment, useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../store/user/user.selector";

import IncomeBox from "../income-box/income-box.component";
import AddIncomeModal from "../add-income-modal/add-income-modal.component";
import AddExpenseModal from "../add-expense-modal/add-expense-modal.component";

import "./dashboard-info.styles.scss";

const DashboardInfo = ({ userDocument }) => {
	const currentUser = useSelector(selectCurrentUser);
	const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
	const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

	const { financialStatus } = userDocument;

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
		<Fragment>
			<div className="financial-info">
				<div className="income-container">
					<h2>Income: {financialStatus.income.total}</h2>
					<div className="incomes-list">
						{financialStatus.income.incomes.map((income) => {
							return <IncomeBox key={income.id} income={income} />;
						})}
					</div>
				</div>
				<div className="other-fin-info">
					<h2>Expenses: {financialStatus.expenses.total}</h2>
					<h2>Remaining: {financialStatus.remaining}</h2>
				</div>
				<button type="button" onClick={handleAddIncomeModalOpenClick}>
					Add income
				</button>
				<button type="button" onClick={handleAddExpenseModalOpenClick}>
					Remove income
				</button>
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
		</Fragment>
	);
};

export default DashboardInfo;
