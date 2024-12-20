import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/UserDAO';
import { initDB } from '../db/db';
import { User } from '../models/User';
import { LoginDto } from '../dto/user/login.dto';
import { RegisterDto } from '../dto/user/register.dto';

const ACCESS_TOKEN_SECRET = 'abc';
const REFRESH_TOKEN_SECRET = 'abc';

const refreshTokenStore = new Map<number, { token: string; expiresAt: Date }>();


export class AuthController {

    static async login(req: Request, res: Response) {

        try {
            const dto = LoginDto.fromRequest(req.body);

            if (dto instanceof Error) {
                return res.status(400).json({ message: dto.message});
            }
            
            const db = await initDB();
            const userDAO = new UserDAO(db);
    
            const user = await userDAO.getUserByMail(dto.email); 
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isPasswordValid = await bcrypt.compare(dto.password, user.password);
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

    static async register(req: Request, res: Response) {

        try {
            const dto = RegisterDto.fromRequest(req.body);

            if (dto instanceof Error) {
                return res.status(400).json({ message: dto.message});
            }
    
            const db = await initDB();
            const userDAO = new UserDAO(db);
            const existingUser = await userDAO.getUserByMail(dto.email);
            if (existingUser) {
                return res.status(409).json({ message: 'Email already taken' });
            }
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const newUser = new User(0, dto.email, dto.username, hashedPassword, false);
            await userDAO.createUser(newUser);
            return res.status(201).json({
                message: "Account created successfully",
                user: { 
                    email: newUser.email, 
                    username: newUser.username 
                },
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }


    static async refreshToken(req: Request, res: Response) {
        const  refreshToken  = req.body.token;
        console.log(req);

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
          return null;
        }
    
        const token = authHeader;
    
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: number };

            const db = await initDB();
            const userDAO = new UserDAO(db);

            const user = await userDAO.getUserById(decoded.userId);

            return user || null; 
        } catch (error) {
            console.error('Token verification failed:', error);
            return null; 
        }
    }
}


function generateAccessToken(userId: number): string {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
}

function generateRefreshToken(userId: number): { token: string; expiresAt: Date } {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    const token = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '100d' });
    refreshTokenStore.set(userId, { token, expiresAt });
    return { token, expiresAt };
}