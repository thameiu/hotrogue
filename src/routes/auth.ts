import express from 'express';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();

// Login route
router.post('/login', AuthController.login as any);

// Refresh token route
router.post('/refresh-token', AuthController.refreshToken as any);

export default router;
