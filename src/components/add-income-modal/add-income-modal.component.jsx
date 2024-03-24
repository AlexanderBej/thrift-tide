import { useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { updateUserDoc } from "../../utils/firebase/firebase.utils";
import { setUserDocument } from "../../store/user-document/user-document.slice";

import FormInput from "../form-input/form-input.component";

import "./add-income-modal.styles.scss";

const defaultFormFields = {
	amount: 0,
	from: "",
};

const AddIncomeModal = ({ isAddIncomeModalOpen, onAddIncomeModalClose, financialStatus, currentUser, userDocument }) => {
	const dispatch = useDispatch();
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);

	const { amount, from } = formFields;

	const addIncome = () => {
		console.log("add income called");
		const remainingIncome = financialStatus.remaining;
		const totalIncome = financialStatus.income.total;
		const incomesLength = financialStatus.income.incomes.length;

		const newFinancialStatus = buildNewFinancialStatusObject(remainingIncome, totalIncome, incomesLength);

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
		console.log(formFields);
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
					<p>Lorem ipsum add income</p>
					<button onClick={addIncome}>Add income</button>
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
								<input type="radio" value="Cash" name="from" onChange={handleChange} />
								Cash
							</label>
							<label>
								<input type="radio" value="Bank" name="from" onChange={handleChange} />
								Bank
							</label>
							<label>
								<input type="radio" value="Savings" name="from" onChange={handleChange} />
								savings
							</label>
						</div>

						<button type="submit">Submit</button>
					</form>
				</aside>
			</div>
		</section>
	);
};

export default AddIncomeModal;
