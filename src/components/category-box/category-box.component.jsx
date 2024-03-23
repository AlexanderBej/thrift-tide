import "./category-box.styles.scss";

const CategoryBox = ({ category }) => {

	return (
		<div className="category-container">
			<h3>{category.title}</h3>
			{category.expenses && category.expenses.map((expense) => {
				return (
					<div key={expense.id} className="category-expense">
						<span>{expense.date.date} - {expense.date.time}</span>
						<span>{expense.reason}</span>
						<span>{expense.amount}</span>
					</div>
				);
			})}
		</div>
	);
};

export default CategoryBox;
