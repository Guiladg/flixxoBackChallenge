import { Router } from 'express';
import auth from './auth';
import currency from './currency';
import price from './price';

const routes = Router();

routes.use('/auth', auth);
routes.use('/currency', currency);
routes.use('/price', price);
export default routes;
