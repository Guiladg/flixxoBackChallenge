import * as dotenv from 'dotenv';
import User from './models/user';
import Currency from './models/currency';
import Price from './models/price';
import dataSource from './dataSource';

// Load .env file
dotenv.config();

// Data to insert in DB
const users = [{ firstName: 'admin', lastName: 'admin', username: 'admin', password: 'admin', email: 'admin@admin.com', role: 'admin' }];
const currencies = [
	{
		symbol: 'BTC',
		name: 'Bitcoin',
		introductionYear: 2009,
		prices: [
			{ date: new Date('2023-09-14T10:00:00.000Z'), value: 1 },
			{ date: new Date('2023-09-02T10:00:00.000Z'), value: 2 },
			{ date: new Date('2023-09-03T10:00:00.000Z'), value: 3 },
			{ date: new Date('2023-09-04T10:00:00.000Z'), value: 4 }
		]
	},
	{
		symbol: 'ETH',
		name: 'Ethereum',
		introductionYear: 2015,
		prices: [
			{ date: new Date('2023-09-14T10:00:00.000Z'), value: 1 },
			{ date: new Date('2023-09-02T10:00:00.000Z'), value: 2 },
			{ date: new Date('2023-09-03T10:00:00.000Z'), value: 3 },
			{ date: new Date('2023-09-04T10:00:00.000Z'), value: 4 }
		]
	},
	{
		symbol: 'FLIXX',
		name: 'Flixxo',
		introductionYear: 2018,
		prices: [
			{ date: new Date('2023-09-14T10:00:00.000Z'), value: 1 },
			{ date: new Date('2023-09-02T10:00:00.000Z'), value: 2 },
			{ date: new Date('2023-09-03T10:00:00.000Z'), value: 3 },
			{ date: new Date('2023-09-04T10:00:00.000Z'), value: 4 }
		]
	}
];

// Execute inserts
dataSource
	.initialize()
	.then(async () => {
		// Users
		for (const newData of users) {
			const newRecord = new User();
			for (const [key] of Object.entries(newData)) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				newRecord[key] = newData[key];
			}
			newRecord.hashPassword();
			try {
				await newRecord.save();
				console.info('User created ok:', newData.username);
			} catch (err) {
				console.error('User creating error:', newData.username, err);
			}
		}

		// Currencies and prices
		for (const newData of currencies) {
			const newRecord = new Currency();
			for (const [key] of Object.entries(newData)) {
				if (key === 'prices') {
					const subRecords = [];
					for (const newSubData of newData[key]) {
						const newSubRecord = new Price();
						for (const [key] of Object.entries(newSubData)) {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							newSubRecord[key] = newSubData[key];
						}
						subRecords.push(newSubRecord);
					}
					newRecord[key] = subRecords;
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					newRecord[key] = newData[key];
				}
			}
			try {
				await newRecord.save();
				console.info('Currency created ok:', newData.name);
			} catch (err) {
				console.error('Currency creating error:', newData.name, err);
			}
		}

		process.exit();
	})
	.catch((error) => console.error(error));
