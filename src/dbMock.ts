/**
 * This file runs bulk inserts to set the database in an initial state
 * that can be used to test the api endpoints.
 */

import DB from './DB';
import Currency from './models/currency';
import Price from './models/price';
import User from './models/user';

// Initialize DB connection and sync
const sequelize = DB.getInstance();
sequelize.sync({ alter: true });

// Run the bulk inserts
(async () => {
	await User.create({
		username: 'admin',
		password: 'admin',
		role: 'admin',
		email: 'admin@admin.com'
	});
	const btc = await Currency.create({
		symbol: 'BTC',
		name: 'Bitcoin',
		introductionYear: 2009
	});
	const eth = await Currency.create({
		symbol: 'ETH',
		name: 'Ethereum',
		introductionYear: 2015
	});
	const flixx = await Currency.create({
		symbol: 'FLIXX',
		name: 'Flixxo',
		introductionYear: 2018
	});
	await Price.bulkCreate([
		{ CurrencyId: btc.id, date: new Date('2023-09-14T10:00:00.000Z'), value: 1 },
		{ CurrencyId: btc.id, date: new Date('2023-09-02T10:00:00.000Z'), value: 2 },
		{ CurrencyId: btc.id, date: new Date('2023-09-03T10:00:00.000Z'), value: 3 },
		{ CurrencyId: btc.id, date: new Date('2023-09-04T10:00:00.000Z'), value: 4 }
	]);
	await Price.bulkCreate([
		{ CurrencyId: eth.id, date: new Date('2023-09-14T10:00:00.000Z'), value: 1 },
		{ CurrencyId: eth.id, date: new Date('2023-09-02T10:00:00.000Z'), value: 2 },
		{ CurrencyId: eth.id, date: new Date('2023-09-03T10:00:00.000Z'), value: 3 },
		{ CurrencyId: eth.id, date: new Date('2023-09-04T10:00:00.000Z'), value: 4 }
	]);
	await Price.bulkCreate([
		{ CurrencyId: flixx.id, date: new Date('2023-09-14T10:00:00.000Z'), value: 1 },
		{ CurrencyId: flixx.id, date: new Date('2023-09-02T10:00:00.000Z'), value: 2 },
		{ CurrencyId: flixx.id, date: new Date('2023-09-03T10:00:00.000Z'), value: 3 },
		{ CurrencyId: flixx.id, date: new Date('2023-09-04T10:00:00.000Z'), value: 4 }
	]);
})().finally(() => process.exit());
