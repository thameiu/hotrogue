import express from 'express';
import { AuthController } from '../controllers/auth/AuthController.controller';
import { rbacMiddleware } from '../middleware/rbacMiddleware';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the application
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 accessToken:
 *                   type: string
 *                   example: "access_token_here"
 *                 refreshToken:
 *                   type: string
 *                   example: "refresh_token_here"
 *       400:
 *         description: Invalid credentials or bad request
 *       401:
 *         description: Unauthorized (Invalid email or password)
 *       500:
 *         description: Internal server error
 */
router.post('/login', AuthController.login as any);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the new user.
 *               username:
 *                 type: string
 *                 description: The username of the new user.
 *               password:
 *                 type: string
 *                 description: The password of the new user.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirmation of the password.
 *             required:
 *               - email
 *               - username
 *               - password
 *               - passwordConfirm
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     username:
 *                       type: string
 *                       example: "username123"
 *       400:
 *         description: Invalid data or bad request
 *       409:
 *         description: Email already taken
 *       500:
 *         description: Internal server error
 */
router.post('/register', AuthController.register as any);


// Refresh token route
router.post('/refresh-token', AuthController.refreshToken as any);

export default router;
