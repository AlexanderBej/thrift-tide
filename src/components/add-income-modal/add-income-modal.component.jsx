import { useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { updateUserDoc } from "../../utils/firebase/firebase.utils";
import { setUserDocument } from "../../store/user-document/user-document.slice";

import FormInput from "../form-input/form-input.component";
import Button from "../button/button.component";

const defaultFormFields = {
	amount: "",
	from: "",
};

const AddIncomeModal = ({ isAddIncomeModalOpen, onAddIncomeModalClose, financialStatus, currentUser, userDocument }) => {
	const dispatch = useDispatch();
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);

	const { amount, from } = formFields;

	const addIncome = () => {
		const remaining = financialStatus.remaining;
		const total = financialStatus.income.total;
		const length = financialStatus.income.incomes.length;

		const newFinancialStatus = buildNewFinancialStatusObject(remaining, total, length);

		updateUserDoc(currentUser, newFinancialStatus);

		const newUserDocument = {
			...userDocument,
			financialStatus: newFinancialStatus,
		};

		dispatch(setUserDocument(newUserDocument));
	};

	const buildNewFinancialStatusObject = (remainingIncome, totalIncome, incomesLength) => {
		return {
			...financialStatus,
			remaining: remainingIncome + +amount,
			income: {
				total: totalIncome + +amount,
				incomes: [
					...financialStatus.income.incomes,
					{
						id: incomesLength + 1,
						from: from,
						amount: amount,
						addedAt: {
							date: new Date().toLocaleDateString(),
							time: new Date().toLocaleTimeString(),
						},
					},
				],
			},
		};
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		addIncome();
		resetFormFields();
		onAddIncomeModalClose();
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormFields({ ...formFields, [name]: value });
	};

	const resetFormFields = () => {
		setFormFields(defaultFormFields);
	};

	return (
		<section className={"modal-overlay" + (isAddIncomeModalOpen ? " width-full" : "")} onClick={onAddIncomeModalClose}>
			<div className="modal-container">
				<aside className="modal-content" onClick={(e) => e.stopPropagation()}>
					<header>
						<h3 className="modal-header">Add new income</h3>
					</header>
					<form ref={form} onSubmit={handleSubmit} className="modal-body">
						<FormInput
							label="Amount"
							type="number"
							inputType={"input"}
							inputMode="number"
							onChange={handleChange}
							name="amount"
							required
							value={amount}
							customClassName="modal-input"
						/>

						<div className="radio-container">
							<label>
								<input type="radio" className="transaction-radio" value="Cash" name="from" onChange={handleChange} />
								<div className="radio-box">Cash</div>
							</label>
							<label>
								<input type="radio" className="transaction-radio" value="Bank" name="from" onChange={handleChange} />
								<div className="radio-box">Bank</div>
							</label>
							<label>
								<input type="radio" className="transaction-radio" value="Savings" name="from" onChange={handleChange} />
								<div className="radio-box">Savings</div>
							</label>
						</div>

						<Button type="submit" customClassName="submit-btn">Add income</Button>
					</form>
				</aside>
			</div>
		</section>
	);
};

export default AddIncomeModal;
