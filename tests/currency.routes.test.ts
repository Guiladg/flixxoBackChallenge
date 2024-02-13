import * as dotenv from 'dotenv';
import path from 'path';
import request from 'supertest';
import app from '../src/app';
import DB from '../src/DB';
import { Sequelize } from 'sequelize';

// Load .env file
dotenv.config();

// API route
const route = path.posix.join('/', process.env.API_ROUTE ?? '');

// DB instance
let sequelize: Sequelize;

describe(`Currency API`, () => {
	// Before any tests run, wait for sequelize to sync
	beforeAll(async () => {
		sequelize = DB.getInstance();
		await sequelize.sync({ alter: true });
	});

	// Test routes individually
	it('should get data', async () => {
		const res = await request(app).get(`${route}/currency`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('records');
		expect(res.body).toHaveProperty('totalRecords');
	});

	// After all tests have finished, close the DB connection
	afterAll(async () => {
		await sequelize.close();
	});
});
