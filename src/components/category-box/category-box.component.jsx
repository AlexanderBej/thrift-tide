import "./category-box.styles.scss";

import TransactionBox from "../transaction-box/transaction-box.component";

const CategoryBox = ({ categoryList, categoryTitle = "", type, ...otherProps }) => {
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // JavaScript months are zero-based, so add 1

	return (
		<div {...otherProps}>
			<h3 className="category-header">{categoryTitle}</h3>
			<div className="category-transactions">
				{categoryList &&
					categoryList
						.filter((transactions) => {
							const [month] = transactions.date ? transactions.date.date.split("/") : transactions.addedAt.date.split("/");
							return parseInt(month, 10) === currentMonth;
						})
						.map((transaction) => {
							return (
								<TransactionBox
									key={transaction.id}
									date={transaction.date ? transaction.date : transaction.addedAt}
									text={transaction.reason ? transaction.reason : transaction.from}
									amount={transaction.amount}
									type={type}
								/>
							);
						})}
			</div>
		</div>
	);
};

export default CategoryBox;
