import { Fragment, useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../store/user/user.selector";
import AddExpenseModal from "../add-expense-modal/add-expense-modal.component";
import AddIncomeModal from "../add-income-modal/add-income-modal.component";

import "./transaction-buttons.styles.scss";

const TransactionButtons = ({ financialStatus, userDocument, currency }) => {
	const currentUser = useSelector(selectCurrentUser);
	const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
	const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

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
			<div className="transaction-btns">
				<button className="transaction-btn add-income-btn" type="button" onClick={handleAddIncomeModalOpenClick}>
					+
				</button>
				<button className="transaction-btn add-transaction-btn" type="button" onClick={handleAddExpenseModalOpenClick}>
					--
				</button>
			</div>
			<section>
				<AddIncomeModal
					isAddIncomeModalOpen={isAddIncomeModalOpen}
					onAddIncomeModalClose={closeAddIncomeModal}
					financialStatus={financialStatus}
					currentUser={currentUser}
					userDocument={userDocument}
					currency={currency}
				/>
				<AddExpenseModal
					isAddExpenseModalOpen={isAddExpenseModalOpen}
					onAddExpenseModalClose={closeAddExpenseModal}
					financialStatus={financialStatus}
					currentUser={currentUser}
					userDocument={userDocument}
					currency={currency}
				/>
			</section>
		</Fragment>
	);
};

export default TransactionButtons;
