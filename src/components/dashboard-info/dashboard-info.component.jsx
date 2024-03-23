import { useDispatch, useSelector } from "react-redux";

import { updateUserDoc } from "../../utils/firebase/firebase.utils";
// import { setUserFinancialStatus } from "../../store/user-financial-status/user-financial-status.slice";
import { selectCurrentUser } from "../../store/user/user.selector";

import "./dashboard-info.styles.scss";
import { setUserDocument } from "../../store/user-document/user-document.slice";
import IncomeBox from "../income-box/income-box.component";

// const DashboardInfo = ({ userFinancialStatus }) => {
// 	const dispatch = useDispatch();
// 	const currentUser = useSelector(selectCurrentUser);

// 	const addIncome = () => {
// 		console.log("add income called");

// 		const incomeToAdd = 100;

// 		const newFinancialStatus = {
// 			...userFinancialStatus,
// 			remaining: userFinancialStatus.remaining + incomeToAdd,
// 			income: {
// 				total: userFinancialStatus.income.total + incomeToAdd,
// 				incomes: [
// 					...userFinancialStatus.income.incomes,
// 					{
// 						from: "cash",
// 						amount: incomeToAdd,
// 						addedAt: {
// 							date: new Date().toLocaleDateString(),
// 							time: new Date().toLocaleTimeString(),
// 						},
// 					},
// 				],
// 			},
// 		};

// 		updateUserDoc(currentUser, newFinancialStatus);
// 		dispatch(setUserDocument(newFinancialStatus));
// 	};

// 	const removeIncome = () => {
// 		const incomeToRemove = 40;

// 		const newFinancialStatus = {
// 			...userFinancialStatus,
// 			expenses: {
// 				...userFinancialStatus.expenses,
// 				total: userFinancialStatus.expenses.total + incomeToRemove,
// 				needs: {
// 					title: "Needs",
// 					expenses: [
// 						...userFinancialStatus.expenses.needs.expenses,
// 						{
// 							id: userFinancialStatus.expenses.needs.expenses.length + 1,
// 							date: {
// 								date: new Date().toLocaleDateString(),
// 								time: new Date().toLocaleTimeString(),
// 							},
// 							reason: "game",
// 							amount: incomeToRemove,
// 						},
// 					],
// 				},
// 			},
// 			remaining: userFinancialStatus.remaining - incomeToRemove,
// 		};

// 		updateUserDoc(currentUser, newFinancialStatus);
// 		dispatch(setUserDocument(newFinancialStatus));
// 	};

// 	return (
// 		<div>
// 			<h2>Income: {userFinancialStatus.income.total}</h2>
// 			<h2>Expenses: {userFinancialStatus.expenses.total}</h2>
// 			<h2>Remaining: {userFinancialStatus.remaining}</h2>
// 			<button type="button" onClick={addIncome}>
// 				Add income
// 			</button>
// 			<button type="button" onClick={removeIncome}>
// 				Remove income
// 			</button>
// 		</div>
// 	);
// };

const DashboardInfo = ({ userDocument }) => {
	const dispatch = useDispatch();
	const currentUser = useSelector(selectCurrentUser);

	const { financialStatus } = userDocument;

	const addIncome = () => {
		console.log("add income called");

		const incomeToAdd = 100;

		const newFinancialStatus = {
			...financialStatus,
			remaining: financialStatus.remaining + incomeToAdd,
			income: {
				total: financialStatus.income.total + incomeToAdd,
				incomes: [
					...financialStatus.income.incomes,
					{
						from: "cash",
						amount: incomeToAdd,
						addedAt: {
							date: new Date().toLocaleDateString(),
							time: new Date().toLocaleTimeString(),
						},
					},
				],
			},
		};

		updateUserDoc(currentUser, newFinancialStatus);

		const newUserDocument = {
			...userDocument,
			financialStatus: newFinancialStatus,
		};

		dispatch(setUserDocument(newUserDocument));
	};

	const removeIncome = () => {
		const incomeToRemove = 40;

		const newFinancialStatus = {
			...financialStatus,
			expenses: {
				...financialStatus.expenses,
				total: financialStatus.expenses.total + incomeToRemove,
				needs: {
					title: "Needs",
					expenses: [
						...financialStatus.expenses.needs.expenses,
						{
							id: financialStatus.expenses.needs.expenses.length + 1,
							date: {
								date: new Date().toLocaleDateString(),
								time: new Date().toLocaleTimeString(),
							},
							reason: "game",
							amount: incomeToRemove,
						},
					],
				},
			},
			remaining: financialStatus.remaining - incomeToRemove,
		};

		updateUserDoc(currentUser, newFinancialStatus);

		const newUserDocument = {
			...userDocument,
			financialStatus: newFinancialStatus,
		};

		dispatch(setUserDocument(newUserDocument));
	};

	return (
		<div className="financial-info">
			<div className="income-container">
				<h2>Income: {financialStatus.income.total}</h2>
				<div className="incomes-list">
					{financialStatus.income.incomes.map((income) => {
						return (
							<IncomeBox income={income} />
						);
					})}
				</div>
			</div>
			<div className="other-fin-info">
				<h2>Expenses: {financialStatus.expenses.total}</h2>
				<h2>Remaining: {financialStatus.remaining}</h2>
			</div>
			<button type="button" onClick={addIncome}>
				Add income
			</button>
			<button type="button" onClick={removeIncome}>
				Remove income
			</button>
		</div>
	);
};

export default DashboardInfo;
