import { Router } from 'express';
import AuthController from '../controllers/auth';

const router = Router();

// Login
router.post('/login', AuthController.login);

// Refresh tokens
router.post('/refresh', AuthController.refresh);

// Logout
router.post('/logout', AuthController.logout);

export default router;
