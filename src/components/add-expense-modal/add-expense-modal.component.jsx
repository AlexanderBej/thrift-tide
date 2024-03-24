import { useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { updateUserDoc } from "../../utils/firebase/firebase.utils";
import { setUserDocument } from "../../store/user-document/user-document.slice";

import FormInput from "../form-input/form-input.component";

import "./add-expense-modal.styles.scss";

const defaultFormFields = {
	amount: 0,
	from: "",
	reason: "",
};

const AddExpenseModal = ({ isAddExpenseModalOpen, onAddExpenseModalClose, financialStatus, currentUser, userDocument }) => {
	const dispatch = useDispatch();
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);

	const { amount, from, reason } = formFields;

	const removeIncome = () => {
		const fromExpenses = financialStatus.expenses[from];
		const totalExpenses = financialStatus.expenses.total;
		const expensesLength = financialStatus.expenses[from].expenses.length;

		// const newFinancialStatus = {
		// 	...financialStatus,
		// 	expenses: {
		// 		...financialStatus.expenses,
		// 		total: totalExpenses + +amount,
		// 		[from]: {
		// 			title: fromExpenses.title,
		// 			expenses: [
		// 				...fromExpenses.expenses,
		// 				{
		// 					id: expensesLength + 1,
		// 					date: {
		// 						date: new Date().toLocaleDateString(),
		// 						time: new Date().toLocaleTimeString(),
		// 					},
		// 					reason: reason,
		// 					amount: amount,
		// 				},
		// 			],
		// 		},
		// 	},
		// 	remaining: financialStatus.remaining - +amount,
		// };

		const newFinancialStatus = buildNewFinancialStatusObject(totalExpenses, fromExpenses, expensesLength);

		updateUserDoc(currentUser, newFinancialStatus);

		const newUserDocument = {
			...userDocument,
			financialStatus: newFinancialStatus,
		};

		dispatch(setUserDocument(newUserDocument));
	};

	const buildNewFinancialStatusObject = (totalExpenses, fromExpenses, expensesLength) => {
		return {
			...financialStatus,
			expenses: {
				...financialStatus.expenses,
				total: totalExpenses + +amount,
				[from]: {
					title: fromExpenses.title,
					expenses: [
						...fromExpenses.expenses,
						{
							id: expensesLength + 1,
							date: {
								date: new Date().toLocaleDateString(),
								time: new Date().toLocaleTimeString(),
							},
							reason: reason,
							amount: amount,
						},
					],
				},
			},
			remaining: +financialStatus.remaining - +amount,
		};
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		console.log(formFields);
		removeIncome();
		resetFormFields();
		onAddExpenseModalClose();
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormFields({ ...formFields, [name]: value });
	};

	const resetFormFields = () => {
		setFormFields(defaultFormFields);
	};
	return (
		<section className={"modal-overlay" + (isAddExpenseModalOpen ? " width-full" : "")} onClick={onAddExpenseModalClose}>
			<div className="modal-container">
				<aside className="modal-content" onClick={(e) => e.stopPropagation()}>
					<p>Dolor Sit Amet remove income</p>
					<button onClick={removeIncome}>Remove income</button>

					<form ref={form} onSubmit={handleSubmit}>
						<FormInput
							label="Amount"
							type="number"
							inputType={"input"}
							inputMode="number"
							onChange={handleChange}
							name="amount"
							required
							value={amount}
						/>

						<div>
							<label>
								<input type="radio" value="needs" name="from" onChange={handleChange} />
								Needs
							</label>
							<label>
								<input type="radio" value="wants" name="from" onChange={handleChange} />
								Wants
							</label>
							<label>
								<input type="radio" value="save" name="from" onChange={handleChange} />
								Savings
							</label>
						</div>

						<FormInput label="Reason" type="text" inputType={"input"} onChange={handleChange} name="reason" required value={reason} />

						<button type="submit">Submit</button>
					</form>
				</aside>
			</div>
		</section>
	);
};

export default AddExpenseModal;
