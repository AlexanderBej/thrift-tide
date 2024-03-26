import { Fragment } from "react";

import TransactionBox from "../transaction-box/transaction-box.component";
import { groupByMonth } from "../../utils/stats/stats";

import "./history-box.styles.scss";

const HistoryBox = ({ category, title, type }) => {
	const groupedCategory = groupByMonth(category);

	return (
		<div className="history-box">
			{category && (
				<Fragment>
					<h1>{title}</h1>
					<div className="history-transactions-container">
						{Object.keys(groupedCategory).map((monthYear) => (
							<div key={monthYear}>
								<h3>{monthYear}</h3>
								<div>
									{groupedCategory[monthYear].map((transaction) => (
										<TransactionBox
											key={transaction.id}
											date={transaction.date ? transaction.date : transaction.addedAt}
											text={transaction.from ? transaction.from : transaction.reason}
											amount={transaction.amount}
											type={type}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</Fragment>
			)}
		</div>
	);
};

export default HistoryBox;
