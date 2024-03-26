import "./financial-status-header.styles.scss";

const FinancialStatusHeader = ({categoryTotal, title, currency}) => {
    const isCurrencyRON = (currentCurrency) => {
		if (currentCurrency === "RON") return true;
		return false;
	};
    
	return (
		<h2 className="fin-status-header" name={title}>
			{!isCurrencyRON(currency) && <span className="currency">{currency} </span>}
			{categoryTotal}
			{isCurrencyRON(currency) && <span className="currency"> {currency}</span>}
		</h2>
	);
};

export default FinancialStatusHeader;
