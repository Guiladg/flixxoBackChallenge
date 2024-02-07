import { Router } from 'express';
import AuthController from '../controllers/auth';
import { validateInput } from '../middlewares/validateInput';
import { UserLoginValidationSchema } from '../validators/user';

const router = Router();

// Login
router.post('/login', validateInput(UserLoginValidationSchema), AuthController.login);

// Refresh tokens
router.post('/refresh', AuthController.refresh);

// Logout
router.post('/logout', AuthController.logout);

export default router;
