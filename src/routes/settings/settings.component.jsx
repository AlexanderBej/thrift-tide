import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReactFlagsSelect from "react-flags-select";
import CurrencyList from "currency-list";
import countryToCurrency from "country-to-currency";

import { setCurrency } from "../../store/currency/currency.slice";

import "./settings.styles.scss";

const Settings = () => {
	const [selectedCurrency, setSelectedCurrency] = useState("");
	const dispatch = useDispatch();

	useEffect(() => {
		if (selectedCurrency) {
			const currencyCode = countryToCurrency[selectedCurrency];
			const currencyObject = CurrencyList.get(currencyCode);
			dispatch(setCurrency(currencyObject.symbol));
		}
	}, [dispatch, selectedCurrency]);

	return (
		<div className="dashboard-item regular-dashboard">
			<h4>Select currency</h4>
			<ReactFlagsSelect selected={selectedCurrency} onSelect={(countryCode) => setSelectedCurrency(countryCode)} />
		</div>
	);
};

export default Settings;
