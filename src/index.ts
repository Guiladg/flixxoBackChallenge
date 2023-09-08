import * as dotenv from 'dotenv';
import express from 'express';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/';
import path from 'path';
import dataSource from './dataSource';

// Load .env file
dotenv.config();

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
