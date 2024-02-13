import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load .env file
dotenv.config();

/** The Singleton class defines the `getInstance` method that lets clients access the unique singleton instance. 	*/
export default class DB {
	// Connection instance
	private static instance: Sequelize;

	/** As singleton, constructor is private to prevent "new DB()". */
	private constructor() {
		// Create a new database connection
		DB.instance = new Sequelize(process.env.DB_NAME, process.env.DB_USER, String(process.env.DB_PASSWORD), {
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			logQueryParameters: process.env.NODE_ENV !== 'production',
			// This project can run on MySQL or PostgreSQL
			dialect: 'postgres'
		});

		// Test connection
		DB.instance
			.authenticate()
			.then(async () => {
				console.info(`\n***************************************************************************`);
				console.info('*  Connection with DB has been initialized');
				console.info(`***************************************************************************\n`);
			})
			.catch((error: any) => {
				console.error(`\n***************************************************************************`);
				console.error('*  Error initializing database:', error);
				console.error(`***************************************************************************\n`);
			});
	}

	/** Access singleton instance. */
	public static getInstance(): Sequelize {
		if (!DB.instance) {
			new DB();
		}

		return DB.instance;
	}
}
