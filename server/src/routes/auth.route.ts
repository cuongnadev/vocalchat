import { AuthController } from '@/controllers/auth.controller';
import { Router } from 'express';

const router = Router();

router.post('/register', AuthController.register);
router.post('/verify-code', AuthController.verify);
router.post('/update-info', AuthController.updateProfile);
router.post('/login', AuthController.login);

export const authRoutes = router;
