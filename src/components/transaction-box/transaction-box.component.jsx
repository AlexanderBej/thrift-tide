import "./transaction-box.styles.scss";

const TransactionBox = ({ date, text, amount }) => {
	return (
		<div className="transaction-box">
			<div className="date-box">
				<span className="date-span">{date.date}</span>
				<span className="time-span">{date.time}</span>
			</div>
			<span>{text}</span>
			<span>{amount}</span>
		</div>
	);
};

export default TransactionBox;
