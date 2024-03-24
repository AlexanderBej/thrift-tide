import "./category-box.styles.scss";

import TransactionBox from "../transaction-box/transaction-box.component";

const CategoryBox = ({ category, ...otherProps }) => {
	return (
		<div {...otherProps}>
			<h3 className="category-header">{category.title}</h3>
			<div className="category-transactions">
				{category.expenses &&
					category.expenses.map((expense) => {
						return <TransactionBox key={expense.id} date={expense.date} text={expense.reason} amount={expense.amount} />;
					})}
			</div>
		</div>
	);
};

export default CategoryBox;
