import { useState, useEffect } from "react";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import "./custom-line-chart.styles.scss";

const CustomLineChart = ({ createdAt, financialStatus }) => {
	const [months, setMonths] = useState([]);

	useEffect(() => {
		const generateMonths = (startDate) => {
			if (startDate) {
				const currentDate = new Date();
				const milliseconds = startDate.seconds * 1000 + startDate.nanoseconds / 1000000;
				const start = new Date(milliseconds);
				const monthList = [];

				while (start < currentDate) {
					const year = start.getFullYear();
					const month = start.getMonth() + 1; // Month index starts from 0
					monthList.push(`${month.toString().padStart(2, "0")}/${year}`);
					start.setMonth(start.getMonth() + 1);
				}

				setMonths(monthList);
			}
		};

		generateMonths(createdAt);
	}, [createdAt]);

	const groupByMonth = (data) => {
		const groupedData = {};
		if (data) {
			data.forEach((obj) => {
				const [month, day, year] = obj.date ? obj.date.date.split("/") : obj.addedAt.date.split("/");
				const monthYear = `${month}/${year}`;
				if (!groupedData[monthYear]) {
					groupedData[monthYear] = [];
				}
				groupedData[monthYear].push(obj);
			});
			return groupedData;
		}
	};

	const needsGroupedByMonth = groupByMonth(financialStatus.expenses.needs.expenses);
	const wantsGroupedByMonth = groupByMonth(financialStatus.expenses.wants.expenses);
	const savingsGroupedByMonth = groupByMonth(financialStatus.expenses.save.expenses);
	const incomeGroupedByMonth = groupByMonth(financialStatus.income.incomes);

	console.log(needsGroupedByMonth, wantsGroupedByMonth, savingsGroupedByMonth, incomeGroupedByMonth);

	const removeLeadingZero = (str) => {
		if (str.charAt(0) === "0") {
			return str.substring(1);
		}
		return str;
	};

	const arrayToBuild = months
		.map((month) => {
			const monthString = month.toString();
			const zeroLessMonth = removeLeadingZero(monthString);

			const matchingNeeds = Object.entries(needsGroupedByMonth)
				.filter(([needMonth]) => {
					const needMonthString = needMonth.toString();
					const zeroLessNeedMonth = removeLeadingZero(needMonthString);
					return zeroLessNeedMonth === zeroLessMonth;
				})
				.map(([, needs]) => needs.reduce((accumulator, currentValue) => accumulator + +currentValue.amount, 0));

			const matchingWants = Object.entries(wantsGroupedByMonth)
				.filter(([wantMonth]) => {
					const wantMonthString = wantMonth.toString();
					const zeroLessWantMonth = removeLeadingZero(wantMonthString);
					return zeroLessWantMonth === zeroLessMonth;
				})
				.map(([, wants]) => wants.reduce((accumulator, currentValue) => accumulator + +currentValue.amount, 0));

			const matchingSavings = Object.entries(savingsGroupedByMonth)
				.filter(([savingMonth]) => {
					const savingMonthString = savingMonth.toString();
					const zeroLessSavingMonth = removeLeadingZero(savingMonthString);
					return zeroLessSavingMonth === zeroLessMonth;
				})
				.map(([, savings]) => savings.reduce((accumulator, currentValue) => accumulator + +currentValue.amount, 0));

			const matchingIncome = Object.entries(incomeGroupedByMonth)
				.filter(([incomeMonth]) => {
					const incomeMonthString = incomeMonth.toString();
					const zeroLessIncomeMonth = removeLeadingZero(incomeMonthString);
					return zeroLessIncomeMonth === zeroLessMonth;
				})
				.map(([, income]) => income.reduce((accumulator, currentValue) => accumulator + +currentValue.amount, 0));

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

	console.log(arrayToBuild);

	return (
		<div className="chart-container">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					width={500}
					height={300}
					data={arrayToBuild}
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
