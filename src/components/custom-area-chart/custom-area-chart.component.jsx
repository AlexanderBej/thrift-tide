import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { groupByMonth, generateMonthsFromStartToNow, matchObjectAndSumAmount, removeLeadingZero } from "../../utils/stats/stats";

const CustomAreaChart = ({ createdAt, savings }) => {
	const months = generateMonthsFromStartToNow(createdAt);
	const savingsGroupedByMonth = groupByMonth(savings.expenses);

	const chartData =
		months &&
		months
			.map((month) => {
				const monthString = month.toString();
				const zeroLessMonth = removeLeadingZero(monthString);

				const matchingSavings = matchObjectAndSumAmount(savingsGroupedByMonth, zeroLessMonth);

				const totalSavingsAmount = matchingSavings.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

				return {
					name: monthString,
					savings: totalSavingsAmount,
				};
			})
			.flat();

	return (
		<div className="chart-container">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					width={500}
					height={400}
					data={chartData}
					margin={{
						top: 10,
						right: 30,
						left: 0,
						bottom: 0,
					}}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Area type="monotone" dataKey="savings" stroke="#ffbb28" fill="#ffbb28" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default CustomAreaChart;
