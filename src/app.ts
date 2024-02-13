import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/';
import path from 'path';
import { unhandledError } from './middlewares/unhandledError';

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
export default app;
