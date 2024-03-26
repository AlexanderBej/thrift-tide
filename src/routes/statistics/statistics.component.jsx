import { Fragment } from "react";
import { useSelector } from "react-redux";

import { selectUserDocument } from "../../store/user-document/user-document.selector";

import CustomPieChart from "../../components/custom-pie-chart/custom-pie-chart.component";
import CustomBarChart from "../../components/custom-bar-chart/custom-bar-chart.component";
import CustomLineChart from "../../components/custom-line-chart/custom-line-chart.component";
import CustomAreaChart from "../../components/custom-area-chart/custom-area-chart.component";

import "./statistics.styles.scss";

const Statistics = () => {
	const userDocument = useSelector(selectUserDocument);

	const { createdAt, financialStatus } = userDocument;
	const {
		expenses: { needs, wants, save },
	} = financialStatus;

	const pieData = [
		{ name: "Needs", value: needs.total },
		{ name: "Wants", value: wants.total },
		{ name: "Savings", value: save.total },
	];

	return (
		<Fragment>
			<div className="dashboard-item legend">
				<h4 className="statistics-header">Legend</h4>
				<div className="legend-box">
					<div className="color-box needs-box" />
					<span>Needs</span>
				</div>
				<div className="legend-box">
					<div className="color-box wants-box" />
					<span>Wants</span>
				</div>
				<div className="legend-box">
					<div className="color-box save-box" />
					<span>Savings</span>
				</div>
			</div>
			<div className="dashboard-item pie-dashboard">
				<h4 className="statistics-header">Expenses over time</h4>
				<CustomPieChart pieData={pieData} />
			</div>
			<div className="dashboard-item dashboard-bar-chart">
				<h4 className="statistics-header">Expenses in the last month / category</h4>
				<div className="chart-content">
					<CustomBarChart title={"Needs"} category={needs} color={"0088fe"} />
					<CustomBarChart title={"Wants"} category={wants} color={"00c49f"} />
					<CustomBarChart title={"Savings"} category={save} color={"ffbb28"} />
				</div>
			</div>
			<div className="dashboard-item dashboard-line-chart">
				<h4 className="statistics-header">Income and expenses over time</h4>
				<div className="chart-content no-overflow">
					<CustomLineChart createdAt={createdAt} financialStatus={financialStatus} />
				</div>
			</div>
			<div className="dashboard-item dashboard-area-chart">
				<h4 className="statistics-header">Savings over time</h4>
				<div className="chart-content no-overflow">
					<CustomAreaChart createdAt={createdAt} savings={save} />
				</div>
			</div>
		</Fragment>
	);
};

export default Statistics;
