import { Router } from 'express';
import CurrencyController from '../controllers/currency';

const router = Router();

// List supported tokens
router.get('/', CurrencyController.listAll);

export default router;
