import { useSelector } from "react-redux";

import { selectUserDocument } from "../../store/user-document/user-document.selector";

import "./history.styles.scss";
import HistoryBox from "../../components/history-box/history-box.component";

const History = () => {
	const userDocument = useSelector(selectUserDocument);

	const {
		financialStatus: {
			income: { incomes },
			expenses,
		},
	} = userDocument;

	console.log(incomes);

	return (
		<div className="dashboard-item history-dashboard">
			<HistoryBox category={incomes} title={"Incomes"} />
			<HistoryBox category={expenses.needs.expenses} title={expenses.needs.title} />
			<HistoryBox category={expenses.wants.expenses} title={expenses.wants.title} />
			<HistoryBox category={expenses.save.expenses} title={expenses.save.title} />
		</div>
	);
};

export default History;
