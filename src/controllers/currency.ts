import { Request, Response } from 'express';
import Currency from '../models/currency';
import { ClientList } from '../types/client';

class CurrencyController {
	/** Send list of currencies. */
	static listAll = async (req: Request, res: Response) => {
		// Get all currencies from table
		const records = await Currency.find({ select: ['name', 'symbol', 'introductionYear'] });

		// Get count of rows (for future pagination)
		const totalRecords = await Currency.count();

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
}

export default CurrencyController;
