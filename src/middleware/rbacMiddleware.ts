import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth/AuthController.controller';

export function rbacMiddleware(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        try {
            const user = await AuthController.getUserByToken(req);

            if (!user) {
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }

            if (user.role === 'banned') {
                return res.status(403).json({ message: 'Forbidden: You have been banned from Tosser of Coin.' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
            }

            req.body.user = user;
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    };
}