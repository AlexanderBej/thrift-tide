import { useSelector } from "react-redux";
import { selectCurrency } from "../../store/currency/currency.selector";

import "./transaction-box.styles.scss";

const TransactionBox = ({ date, text, amount }) => {
	const selectedCurrency = useSelector(selectCurrency);
	const isCurrencyRON = (currentCurrency) => {
		if (currentCurrency === "RON") return true;
		return false;
	};
	return (
		<div className="transaction-box">
			<div className="date-box">
				<span className="date-span">{date.date}</span>
				<span className="time-span">{date.time}</span>
			</div>
			<span>{text}</span>
			<span>
				{!isCurrencyRON(selectedCurrency.currency) && <span className="currency">{selectedCurrency.currency} </span>}
				{amount}
				{isCurrencyRON(selectedCurrency.currency) && <span className="currency"> {selectedCurrency.currency}</span>}
			</span>
		</div>
	);
};

export default TransactionBox;
