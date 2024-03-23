import "./income-box.styles.scss";

const IncomeBox = ({ income }) => {
	const { addedAt, from, amount } = income;

	return (
		<div className="income-box">
			<div className="date-box">
				<span>{addedAt.date}</span>
				<span>{addedAt.time}</span>
			</div>
			<span>{from}</span>
			<span>{amount}</span>
		</div>
	);
};

export default IncomeBox;
