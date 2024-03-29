import { Request, Response } from 'express';
import { ClientList, ClientRecord } from '../types/client';
import Price from '../models/price';
import Currency from '../models/currency';
import { createRecord, updateRecord } from '../utils/crud';
import { FindOptions } from 'sequelize';

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
		const findOptions: FindOptions<Price> = {
			attributes: [...(showIds ? ['id'] : []), 'date', 'value'],
			include: {
				model: Currency,
				as: 'Currency',
				attributes: [],
				where: { symbol },
				required: true
			}
		};

		let data: Price | Price[];
		if (last) {
			data = await Price.findOne(findOptions);
			delete data.id; // Workaround for TypeORM bug
		} else {
			data = await Price.findAll(findOptions);
		}

		return data as any; // Types are ok
	}

	/** Send the last price for the requested currency code. */
	static getLast = async (req: Request, res: Response) => {
		// Currency symbol from url
		const symbol = req.params.symbol.toUpperCase();

		// User is logged in when jwt payload is in request
		const isLoggedIn = Boolean(req?.jwtPayload);

		// Get last price
		const records = await PriceController.getPricesForCurrency(symbol, { last: true, showIds: isLoggedIn });

		// Currency not found
		if (!records) {
			return res.sendStatus(404);
		}

		// Send first element isolated with 200 status code
		res.json(records);
	};

	/** Send historical prices for the requested currency code. */
	static listAll = async (req: Request, res: Response) => {
		// Currency symbol from url
		const symbol = req.params.symbol.toUpperCase();

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
			include: { model: Currency, where: { symbol } }
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
		res.json(ret);
	};

	/** Handle price insertion. */
	static addNew = async (req: Request, res: Response) => {
		// Currency symbol from url
		const symbol = req.params.symbol.toUpperCase();

		// Find currency by symbol
		const currency = await Currency.findOne({ where: { symbol } });

		// No currency error
		if (!currency) {
			return res.sendStatus(404);
		}

		// Create record
		try {
			const record = await createRecord(Price, { data: { CurrencyId: currency.id, ...req.body } });

			// Create return to client object
			const ret: ClientRecord = {
				record,
				message: 'New price inserted Ok'
			};

			// Return 200 and the created record
			res.status(200).json(ret);
		} catch (error) {
			// Return errors with code and message if exists
			res.status(error?.status ?? 500).send(error?.message ?? '');
		}
	};

	/** Handle price edition. */
	static edit = async (req: Request, res: Response) => {
		// Price id from url
		const id = Number(req.params.id);

		// Create record
		try {
			const record = await updateRecord(Price, { data: { id, ...req.body } });

			// Create return to client object
			const ret: ClientRecord = {
				record,
				message: 'Price updated Ok'
			};

			// Return 200 and the updated record
			res.status(200).json(ret);
		} catch (error) {
			// Return errors with code and message if exists
			res.status(error?.status ?? 500).send(error?.message ?? '');
		}
	};
}

export default PriceController;
