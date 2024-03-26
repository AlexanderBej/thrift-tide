import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { generateMonthsFromStartToNow, groupByMonth, matchObjectAndSumAmount, removeLeadingZero } from "../../utils/stats/stats";

const CustomLineChart = ({ createdAt, financialStatus }) => {
	const months = generateMonthsFromStartToNow(createdAt);

	const needsGroupedByMonth = groupByMonth(financialStatus.expenses.needs.expenses);
	const wantsGroupedByMonth = groupByMonth(financialStatus.expenses.wants.expenses);
	const savingsGroupedByMonth = groupByMonth(financialStatus.expenses.save.expenses);
	const incomeGroupedByMonth = groupByMonth(financialStatus.income.incomes);

	const chartData =
		months &&
		months
			.map((month) => {
				const monthString = month.toString();
				const zeroLessMonth = removeLeadingZero(monthString);

				const matchingNeeds = matchObjectAndSumAmount(needsGroupedByMonth, zeroLessMonth);
				const matchingWants = matchObjectAndSumAmount(wantsGroupedByMonth, zeroLessMonth);
				const matchingSavings = matchObjectAndSumAmount(savingsGroupedByMonth, zeroLessMonth);
				const matchingIncome = matchObjectAndSumAmount(incomeGroupedByMonth, zeroLessMonth);

				const totalNeedsAmount = matchingNeeds.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
				const totalWantsAmount = matchingWants.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
				const totalSavingsAmount = matchingSavings.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
				const totalIncomeAmount = matchingIncome.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

				return {
					name: monthString,
					needs: totalNeedsAmount,
					wants: totalWantsAmount,
					savings: totalSavingsAmount,
					income: totalIncomeAmount,
				};
			})
			.flat();

	return (
		<div className="chart-container">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					width={500}
					height={300}
					data={chartData}
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
					<Line type="monotone" dataKey="needs" stroke="#0088fe" activeDot={{ r: 8 }} />
					<Line type="monotone" dataKey="wants" stroke="#00c49f" />
					<Line type="monotone" dataKey="savings" stroke="#ffbb28" />
					<Line type="monotone" dataKey="income" stroke="#825" />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default CustomLineChart;
