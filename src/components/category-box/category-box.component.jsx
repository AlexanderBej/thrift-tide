import "./category-box.styles.scss";

import TransactionBox from "../transaction-box/transaction-box.component";

const CategoryBox = ({ category, ...otherProps }) => {
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // JavaScript months are zero-based, so add 1

	return (
		<div {...otherProps}>
			<h3 className="category-header">{category.title}</h3>
			<div className="category-transactions">
				{category.expenses &&
					category.expenses
					.filter((income) => {
						const [month] = income.date.date.split("/");
						return parseInt(month, 10) === currentMonth;
					})
					.map((expense) => {
						return <TransactionBox key={expense.id} date={expense.date} text={expense.reason} amount={expense.amount} />;
					})}
			</div>
		</div>
	);
};

export default CategoryBox;
