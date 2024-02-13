import DB from './DB';
import app from './app';

// Initialize DB connection and sync
const sequelize = DB.getInstance();
sequelize.sync({ alter: true });

// Start listening requests
app.listen(process.env.PORT, () => {
	console.info(`\n***************************************************************************`);
	console.info(`*  Server started and running.`);
	console.info(`*  Port: ${process.env.PORT}.`);
	console.info(`*  API Route: /${process.env.API_ROUTE}`);
	console.info(`*  Root dir: ${__dirname}.`);
	console.info(`***************************************************************************\n`);
});
