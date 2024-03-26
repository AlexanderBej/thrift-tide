import { useSelector } from "react-redux";

import { selectUserDocument } from "../../store/user-document/user-document.selector";
import HistoryBox from "../../components/history-box/history-box.component";

import "./history.styles.scss";

const History = () => {
	const userDocument = useSelector(selectUserDocument);

	const {
		financialStatus: {
			income: { incomes },
			expenses,
		},
	} = userDocument;

	return (
		<div className="dashboard-item regular-dashboard history-dashboard">
			<HistoryBox category={incomes} title={"Incomes"} />
			<HistoryBox category={expenses.needs.expenses} title={expenses.needs.title} />
			<HistoryBox category={expenses.wants.expenses} title={expenses.wants.title} />
			<HistoryBox category={expenses.save.expenses} title={expenses.save.title} />
		</div>
	);
};

export default History;
