import * as dotenv from 'dotenv';
import { DataSource, LogLevel } from 'typeorm';

// Load .env file
dotenv.config();

// Establish database connection
export const dataSource = new DataSource({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entityPrefix: process.env.DB_PREFIX,
	type: process.env.DB_TYPE as any,
	synchronize: true,
	logging: ['error', ...((process.env.NODE_ENV !== 'production' ? ['query'] : []) as LogLevel[])],
	logger: 'simple-console',
	entities: [__dirname + '/**/models/*.{ts,js}'],
	...(process.env.DB_SSL
		? {
				ssl: true,
				extra: {
					ssl: {
						rejectUnauthorized: false
					}
				}
		  }
		: {})
});

export default dataSource;
