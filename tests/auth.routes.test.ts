import * as dotenv from 'dotenv';
import path from 'path';
import request from 'supertest';
import app from '../src/app';
import DB from '../src/DB';
import * as setCookie from 'set-cookie-parser';
import { Sequelize } from 'sequelize';

// Load .env file
dotenv.config();

// API route
const route = path.posix.join('/', process.env.API_ROUTE ?? '');

// DB instance
let sequelize: Sequelize;

describe(`Auth API`, () => {
	let cookiesString = '';
	let cookies: setCookie.CookieMap = {};

	// Before any tests run, wait for sequelize to sync
	beforeAll(async () => {
		sequelize = DB.getInstance();
		await sequelize.sync({ alter: true });
	});

	// Test routes individually
	it('should login', async () => {
		const res = await request(app).post(`${route}/auth/login`).send({
			username: 'admin',
			password: 'admin'
		});
		expect(res.statusCode).toEqual(200);
		cookiesString = res.headers['set-cookie'];
		cookies = setCookie.parse(cookiesString, { map: true });
		expect(cookies).toHaveProperty('access_token');
		expect(cookies).toHaveProperty('refresh_token');
		expect(cookies).toHaveProperty('control_token');
	});

	it('refresh tokens', async () => {
		const res = await request(app).post(`${route}/auth/refresh`).set('Cookie', cookiesString);
		expect(res.statusCode).toEqual(200);
		const newCookies = res.headers['set-cookie'];
		cookies = setCookie.parse(newCookies, { map: true });
		expect(cookies).toHaveProperty('access_token');
		expect(cookies).toHaveProperty('refresh_token');
		expect(cookies).toHaveProperty('control_token');
		expect(newCookies).not.toEqual(cookies);
		cookiesString = res.headers['set-cookie'];
	});

	it('should logout', async () => {
		const res = await request(app).post(`${route}/auth/logout`).set('Cookie', cookiesString);
		expect(res.statusCode).toEqual(200);
		const newCookies = res.headers['set-cookie'];
		cookies = setCookie.parse(newCookies, { map: true });
		expect(cookies).toHaveProperty('access_token.maxAge', 0);
		expect(cookies).toHaveProperty('refresh_token.maxAge', 0);
		expect(cookies).toHaveProperty('control_token.maxAge', 0);
		cookiesString = newCookies;
	});

	// After all tests have finished, close the DB connection
	afterAll(async () => {
		// Delay closing for 1 second to prevent async errors
		// (i.e.: logout deletes refresh token from DB after sending response)
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await sequelize.close();
	}, 7000);
});
