import { Router } from 'express';
import { register, login, profile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, profile);

export default router;
