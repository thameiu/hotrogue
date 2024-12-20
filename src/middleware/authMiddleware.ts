import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { initDB } from '../db/db';
import { UserDAO } from '../dao/UserDAO';
import { AuthController } from '../controllers/AuthController';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const user = await AuthController.getUserByToken(req);

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
