import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { initDB } from '../db/db';
import { UserDAO } from '../dao/UserDAO';
import { AuthController } from '../controllers/AuthController';

const ACCESS_TOKEN_SECRET = 'your_access_token_secret';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
        console.log('authHeader', authHeader);
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const user = await AuthController.getUserByToken(req);
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        req.body.user = user;
        next(); 
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}
