import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { getUserDocument, updateUserDoc } from "../../utils/firebase/firebase.utils";
import { selectCurrentUser } from "../../store/user/user.selector";
import { setUserFinancialStatus } from "../../store/user-financial-status/user-financial-status.slice";
import { selectUserFinancialStatus } from "../../store/user-financial-status/user-financial-status.selector";
import DashboardMenu from "../../components/dashboard-menu/dashboard-menu.component";

import "./dashboard.styles.scss";
import CategoryBox from "../../components/category-box/category-box.component";

const initialUserData = {
	displayName: "",
	email: "",
	photoURL: "",
};

const Dashboard = () => {
	// console.log("current user uid", currentUser.uid);
	// const [financialStatus, setFinancialStatus] = useState(null);
	const [userData, setUserData] = useState(initialUserData);
	const currentUser = useSelector(selectCurrentUser);

	const userFinancialStatus = useSelector(selectUserFinancialStatus);

	const dispatch = useDispatch();

	useEffect(() => {
		if (currentUser) {
			const getUserFinancialStatus = async () => {
				const userFinancialStatusGot = await getUserDocument(currentUser);
				// setFinancialStatus(categoriesArray.financialStatus);
				dispatch(setUserFinancialStatus(userFinancialStatusGot.financialStatus));
				const { nameToDisplay, email } = userFinancialStatusGot.financialStatus;
				setUserData({ displayName: nameToDisplay, email, photoURL: "" });
				console.log(userFinancialStatusGot);
			};
			getUserFinancialStatus();
		}
	}, [currentUser, dispatch]);

	console.log(userFinancialStatus);

	// const { financialStatus } = userDocument;

	// const { expenses, income } = financialStatus;

	// const { financialStatus } = userDocument;

	// const { expenses, income } = financialStatus;

	const addIncome = () => {
		console.log("add income called");

		const incomeToAdd = 100;

		const newFinancialStatus = {
			...userFinancialStatus,
			income: {
				total: userFinancialStatus.income.total + incomeToAdd,
				incomes: [
					...userFinancialStatus.income.incomes,
					{
						from: "cash",
						amount: incomeToAdd,
						addedAt: new Date(),
					},
				],
			},
		};

		updateUserDoc(currentUser, newFinancialStatus);
		dispatch(setUserFinancialStatus(newFinancialStatus));
	};

	// const { displayName, email, photoURL } = currentUser;
	// const docDisplayName = userDocument.nameToDisplay;

	return (
		<main className="dashboard">
			{userFinancialStatus && (
				<Fragment>
					<DashboardMenu displayName={userData.displayName} email={userData.email} photoURL={userData.photoURL} />
					<div className="main-side">
						<div className="top">
							<h2>Income: {userFinancialStatus.income.total}</h2>
							<h2>Expenses: {userFinancialStatus.expenses.total}</h2>
							<div>
								<h3>Needs</h3>
								{userFinancialStatus.expenses.needs.map((expense) => {
									return <div>An expense here</div>;
								})}
							</div>
							<div>
								<h3>Wants</h3>
								{userFinancialStatus.expenses.wants.map((expense) => {
									return <div>An expense here</div>;
								})}
							</div>
							<div>
								<h3>Savings</h3>
								{userFinancialStatus.expenses.save.map((expense) => {
									return <div>An expense here</div>;
								})}
							</div>
						</div>
						<button type="button" onClick={addIncome}>
							Add income
						</button>
						<div className="bottom">
							<CategoryBox category={userFinancialStatus.expenses.needs} />
							<CategoryBox category={userFinancialStatus.expenses.wants} />
							<CategoryBox category={userFinancialStatus.expenses.save} />
						</div>
					</div>
				</Fragment>
			)}
		</main>
	);
};

export default Dashboard;
