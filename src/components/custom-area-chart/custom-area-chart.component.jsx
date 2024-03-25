import { useState, useEffect } from "react";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import "./custom-area-chart.styles.scss";

const CustomAreaChart = ({ createdAt, savings }) => {
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

	const savingsGroupedByMonth = groupByMonth(savings.expenses);

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

			const matchingSavings = Object.entries(savingsGroupedByMonth)
				.filter(([savingMonth]) => {
					const savingMonthString = savingMonth.toString();
					const zeroLessSavingMonth = removeLeadingZero(savingMonthString);
					return zeroLessSavingMonth === zeroLessMonth;
				})
				.map(([, savings]) => savings.reduce((accumulator, currentValue) => accumulator + +currentValue.amount, 0));

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
					data={arrayToBuild}
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
