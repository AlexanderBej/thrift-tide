export const groupByMonth = (data) => {
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

export const generateMonthsFromStartToNow = (startDate) => {
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

		return monthList;
	}
};

export const matchObjectAndSumAmount = (objectGroupedByMonth, month) => {
	return Object.entries(objectGroupedByMonth)
		.filter(([objMonth]) => {
			const objMonthString = objMonth.toString();
			const zeroLessObjMonth = removeLeadingZero(objMonthString);
			return zeroLessObjMonth === month;
		})
		.map(([, object]) => object.reduce((accumulator, currentValue) => accumulator + +currentValue.amount, 0));
};

export const removeLeadingZero = (str) => {
	if (str.charAt(0) === "0") {
		return str.substring(1);
	}
	return str;
};
