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

describe(`Price API`, () => {
	let cookiesString = '';
	let idPrice = '';

	// Before any tests run, wait for sequelize to sync
	beforeAll(async () => {
		sequelize = DB.getInstance();
		await sequelize.sync({ alter: true });
	});

	// Test routes individually
	it('should get BTC last price', async () => {
		const res = await request(app).get(`${route}/price/btc/last`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('date');
		expect(res.body).toHaveProperty('value');
	});

	it('should get BTC historical prices', async () => {
		const res = await request(app).get(`${route}/price/btc`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('records');
		expect(res.body).toHaveProperty('totalRecords');
	});

	it('should not create a new BTC price b/c no auth is given', async () => {
		const res = await request(app).post(`${route}/price/btc`).send({ value: 50 });
		expect(res.statusCode).toEqual(401);
	});

	it('should login', async () => {
		const res = await request(app).post(`${route}/auth/login`).send({
			username: 'admin',
			password: 'admin'
		});
		expect(res.statusCode).toEqual(200);
		cookiesString = res.headers['set-cookie'];
	});

	it('should create a new BTC price after login', async () => {
		const res = await request(app).post(`${route}/price/btc`).set('Cookie', cookiesString).send({ value: 50 });
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('record');
		console.log('res.body:', res.body);
		idPrice = res.body.record.id;
	});

	it('should update previously inserted BTC price', async () => {
		const res = await request(app).patch(`${route}/price/${idPrice}`).set('Cookie', cookiesString).send({ value: 30 });
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('record');
	});

	// After all tests have finished, close the DB connection
	afterAll(async () => {
		await sequelize.close();
	});
});
