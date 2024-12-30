import express from 'express';
import { UserController } from '../controllers/UserController';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - admin
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the new user
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 description: The email address of the new user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the new user
 *                 example: securepassword123
 *               admin:
 *                 type: boolean
 *                 description: Indicates if the user has admin privileges
 *                 example: false
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     username:
 *                       type: string
 *                       example: johndoe
 *       400:
 *         description: Bad request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input data
 *       409:
 *         description: Conflict - Email already taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: E-mail is already taken
 */
router.post('/', adminMiddleware as any,UserController.createUser as any);


export default router;
