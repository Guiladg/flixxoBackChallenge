import { Router } from 'express';
import { checkJwt, checkJwtAllowPublic } from '../middlewares/checkJwt';
import PriceController from '../controllers/price';

const router = Router();

// List historical prices of one currency. Hide ids for public requests.
router.get('/:symbol', [checkJwtAllowPublic], PriceController.listAll);

// Get last price of one currency. Hide ids for public requests.
router.get('/:symbol/last', [checkJwtAllowPublic], PriceController.getLast);

// Insert a new price for a currency
router.post('/:symbol', [checkJwt], PriceController.addNew);

// Modify an existing price
router.patch('/:id([0-9]+)', [checkJwt], PriceController.edit);

export default router;
