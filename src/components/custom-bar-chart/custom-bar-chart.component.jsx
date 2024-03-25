import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import "./custom-bar-chart.styles.scss";

const CustomBarChart = ({ title, category, color }) => {
	if (category.length === 0) {
		return null;
	}

	const groupedData = category.expenses.reduce((acc, obj) => {
		const key = obj.reason;
		if (!acc[key]) {
			acc[key] = { name: key, totalAmount: 0 };
		}
		acc[key].totalAmount += obj.amount;
		return acc;
	}, {});

	const barData = [];
	Object.values(groupedData).forEach((value) => {
		barData.push({
			name: value.name,
			[title]: +value.totalAmount,
		});
	});

	return (
		<div className="chart-container">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					width={500}
					height={300}
					data={barData}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey={title} fill={`#${color}`} activeBar={<Rectangle fill="pink" stroke="blue" />} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default CustomBarChart;
