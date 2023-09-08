import { Request, Response } from 'express';
import { ClientList } from '../types/client';
import Price from '../models/price';
import { FindManyOptions } from 'typeorm';
import Currency from '../models/currency';
import { validate } from 'class-validator';

export interface ClientPriceNoId {
	value: number;
	date: Date;
}
export interface ClientPriceWithId extends ClientPriceNoId {
	id: number;
}
type ClientPrice<O> = O extends { showIds: true } ? ClientPriceWithId : ClientPriceNoId;
type PriceReturnType<O> = O extends { last: true } ? ClientPrice<O> : ClientPrice<O>[];

export interface GetPricesForCurrencyOptions {
	last?: boolean;
	showIds?: boolean;
}

class PriceController {
	/** Return a list of historical prices of the selected currency or the last value defined by `last` option. Ids are hidden unless `showIds` options is true. */
	static async getPricesForCurrency<O extends GetPricesForCurrencyOptions>(
		symbol: string,
		{ last = false, showIds = false }: O = {} as O
	): Promise<PriceReturnType<O>> {
		// Get all prices from table
		const findOptions: FindManyOptions<Price> = {
			select: {
				id: showIds || last ? true : false, // TypeORM bug that needs to select id when using sql LIMIT
				value: true,
				date: true,
				currency: {
					id: false,
					symbol: false,
					name: false
				}
			},
			where: {
				currency: {
					symbol: symbol.toUpperCase()
				}
			},
			order: {
				date: 'desc'
			},
			relations: ['currency']
		};

		let data: Price | Price[];
		if (last) {
			data = await Price.findOne(findOptions);
			delete data.id; // Workaround for TypeORM bug
		} else {
			data = await Price.find(findOptions);
		}

		return data as any; // Types are ok
	}

	/** Send the last price for the requested currency code. */
	static getLast = async (req: Request, res: Response) => {
		// Currency symbol from url
		const symbol = req.params.symbol;

		// User is logged in when jwt payload is in request
		const isLoggedIn = Boolean(req?.jwtPayload);

		// Get last price
		const records = await PriceController.getPricesForCurrency(symbol, { last: true, showIds: isLoggedIn });

		// Currency not found
		if (!records) {
			return res.sendStatus(404);
		}

		// Send first element isolated with 200 status code
		res.send(records);
	};

	/** Send historical prices for the requested currency code. */
	static listAll = async (req: Request, res: Response) => {
		// Currency symbol from url
		const symbol = req.params.symbol;

		// User is logged in when jwt payload is in request
		const isLoggedIn = Boolean(req?.jwtPayload);

		// Get prices history
		const records = await PriceController.getPricesForCurrency(symbol, { last: false, showIds: isLoggedIn });

		// Currency not found (assuming that at least one price would be available always)
		if (!records.length) {
			return res.sendStatus(404);
		}

		// Get count of rows (for future pagination)
		const totalRecords = await Price.count({
			where: {
				currency: {
					symbol: symbol.toUpperCase()
				}
			}
		});

		// Create return to client object
		const ret: ClientList = {
			records,
			totalRecords,
			page: 0,
			totalPages: 1,
			perPage: 0
		};

		// Send data with 200 status code
		res.send(ret);
	};

	/** Handle price insertion. */
	static addNew = async (req: Request, res: Response) => {
		// Currency symbol from url
		const symbol = req.params.symbol;

		// Data from body
		const { value, date } = req.body;

		// Value validation error
		if (!value || isNaN(Number(value))) {
			return res.sendStatus(409);
		}

		// Find currency by symbol
		const currency = await Currency.findOneBy({ symbol });

		// No currency error
		if (!currency) {
			return res.sendStatus(404);
		}

		// Create temp record
		const record = new Price();
		record.currency = currency;
		record.value = Number(value);
		if (date) {
			record.date = date;
		}

		// Validate data
		const errors = await validate(record);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send();
		}

		// Return 201 and the newly created record without
		res.status(201).send({
			record: record,
			text: 'New price inserted Ok'
		});
	};

	/** Handle price edition. */
	static edit = async (req: Request, res: Response) => {
		// Price id from url
		const id = Number(req.params.id);

		// Data from body
		const { value, date } = req.body;

		// Value validation error
		if (value && isNaN(Number(value))) {
			return res.sendStatus(409);
		}

		// Find currency by symbol
		const record = await Price.findOneBy({ id });

		// No price error
		if (!record) {
			return res.sendStatus(404);
		}

		// Edit temp record
		if (value) {
			record.value = value;
		}
		if (date) {
			record.date = date;
		}

		// Validate data
		const errors = await validate(record);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send();
		}

		// Return 200 and the modified record
		res.status(200).send({
			record: record,
			text: 'Price modified Ok'
		});
	};
}

export default PriceController;
