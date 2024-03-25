import { Fragment } from "react";
import "./history-box.styles.scss";
import TransactionBox from "../transaction-box/transaction-box.component";

const HistoryBox = ({ category, title }) => {
	const groupByMonth = (data) => {
		const groupedData = {};
		if (data) {
			data.forEach((obj) => {
				const [month, day, year] = obj.date ? obj.date.date.split("/") : obj.addedAt.date.split("/");
				const monthYear = `${month}/${year}`;
				if (!groupedData[monthYear]) {
					groupedData[monthYear] = [];
				}
				groupedData[monthYear].push(obj);
			});
			return groupedData;
		}
	};

	const groupedCategory = groupByMonth(category);
	console.log(groupedCategory);

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
									{groupedCategory[monthYear].map((obj) => (
										<TransactionBox
											key={obj.id}
											date={obj.date ? obj.date : obj.addedAt}
											text={obj.from ? obj.from : obj.reason}
											amount={obj.amount}
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
