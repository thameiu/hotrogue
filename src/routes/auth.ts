import express from 'express';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();

// Login route
router.post('/login', AuthController.login);

// Refresh token route
router.post('/refresh-token', AuthController.refreshToken);

export default router;
