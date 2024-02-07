import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/';
import path from 'path';
import dataSource from './dataSource';
import { unhandledError } from './middlewares/unhandledError';

// Load .env file
dotenv.config();

// Initialize DB connection
dataSource
	.initialize()
	.then(async () => {
		console.error(`\n***************************************************************************`);
		console.error('*  Data Source has been initialized');
		console.error(`***************************************************************************\n`);
	})
	.catch((error) => {
		console.error(`\n***************************************************************************`);
		console.error('*  Error initializing database:', error);
		console.error(`***************************************************************************\n`);
	});

// create and setup express app
const app = express();

// Basic middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// API routes (using path.posix to prevent backslashes in URLs when running on Windows)
const useRoutes = path.posix.join('/', process.env.API_ROUTE ?? '');
app.use(useRoutes, routes);

// Add error handling middleware
app.use(unhandledError);

// Start listening requests
app.listen(process.env.PORT, () => {
	console.info(`\n***************************************************************************`);
	console.info(`*  Server started and running.`);
	console.info(`*  Port: ${process.env.PORT}.`);
	console.info(`*  API Route: /${process.env.API_ROUTE}`);
	console.info(`*  Root dir: ${__dirname}.`);
	console.info(`***************************************************************************\n`);
});
