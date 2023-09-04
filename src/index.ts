import * as dotenv from 'dotenv';
import { DataSource, LogLevel } from 'typeorm';
import express from 'express';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/';
import path from 'path';

// Load .env file
dotenv.config();

// Establish database connection
export const dataSource = new DataSource({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	type: 'mysql',
	synchronize: true,
	logging: ['error', ...((process.env.NODE_ENV !== 'production' ? ['query'] : []) as LogLevel[])],
	logger: 'simple-console',
	entities: [__dirname + '/**/models/*.{ts,js}']
});

dataSource
	.initialize()
	.then(async () => {
		// Start express
		const app = express();

		// Middlewares
		app.use(cors({ origin: true, credentials: true }));
		app.use(helmet());
		app.use(cookieParser());
		app.use(bodyParser.json());

		// API routes (fixed for Windows compatibility)
		app.use(path.join('/', process.env.API_ROUTE ?? '').replace('\\', '/'), routes);

		// Start listening requests
		app.listen(process.env.PORT, () => {
			console.info(`\n***************************************************************************`);
			console.info(`*  Server started and running.`);
			console.info(`*  Port: ${process.env.PORT}.`);
			console.info(`*  API Route: /${process.env.API_ROUTE}`);
			console.info(`*  Root dir: ${__dirname}.`);
			console.info(`***************************************************************************\n`);
		});
	})
	.catch((error) => {
		console.error(`\n***************************************************************************`);
		console.error('*  Error initializing database:', error);
		console.error(`***************************************************************************\n`);
	});

console.log('env', process.env.NODE_ENV);
