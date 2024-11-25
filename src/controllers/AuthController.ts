import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/UserDAO';
import { initDB } from '../db/db';
import { User } from '../models/User';

const ACCESS_TOKEN_SECRET = 'abc';
const REFRESH_TOKEN_SECRET = 'abc';

const refreshTokenStore = new Map<number, { token: string; expiresAt: Date }>();


export class AuthController {

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
        const db = await initDB();
        const userDAO = new UserDAO(db);
  
        const user = await userDAO.getUserByMail(email); 
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken: refreshToken.token,
        });
        } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

        try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number };
        const storedToken = refreshTokenStore.get(decoded.userId);

        if (!storedToken || storedToken.token !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(decoded.userId);
        res.status(200).json({ accessToken });
        } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }
    static async getUserByToken(req: Request): Promise<User | null> {
        const authHeader = req.headers.authorization;
    
        if (!authHeader) {
          return null; // No token provided
        }
    
        const token = authHeader;
    
        try {
          // Decode the token
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: number };

            // Access the database
            const db = await initDB();
            const userDAO = new UserDAO(db);

            // Find the user by ID
            const user = await userDAO.getUserById(decoded.userId);

            return user || null; // Return the user if found, otherwise null
        } catch (error) {
            console.error('Token verification failed:', error);
            return null; // Invalid token
        }
    }
}


function generateAccessToken(userId: number): string {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId: number): { token: string; expiresAt: Date } {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    const token = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokenStore.set(userId, { token, expiresAt });
    return { token, expiresAt };
}