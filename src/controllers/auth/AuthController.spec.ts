import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthController } from './AuthController.controller';
import { UserDAO } from '../../dao/UserDAO';
import { initDB } from '../../db/db';
import { User } from '../../models/User';
import { LoginDto } from '../../dto/user/login.dto';

jest.mock('../../db/db');
jest.mock('../../dao/UserDAO');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('AuthController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {};
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 400 if the login DTO validation fails', async () => {
            req.body = { email: '', password: '' };
    
            const expectedError = new Error("Invalid data: email and password are required.");
            
            jest.spyOn(LoginDto, 'fromRequest').mockReturnValueOnce(expectedError);
    
            await AuthController.login(req as Request, res as Response);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expectedError.message });
        });

    

        it('should return 401 if the user is not found', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            jest.spyOn(UserDAO.prototype, 'getUserByMail').mockResolvedValue(null);

            await AuthController.login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should return 200 with tokens on successful login', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            const mockUser = new User(1, 'test@example.com', 'testuser', 'hashedPassword', 'player');
            jest.spyOn(UserDAO.prototype, 'getUserByMail').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
            jest.spyOn(jwt, 'sign').mockImplementation(() => 'mockAccessToken');

            await AuthController.login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login successful',
                accessToken: 'mockAccessToken',
                refreshToken: 'mockAccessToken',
            });
        });
    });

    describe('register', () => {
        it('should return 409 if the email is already taken', async () => {
            req.body = { email: 'test@example.com', username: 'testuser', password: 'password123', passwordConfirm:'password123' };
            jest.spyOn(UserDAO.prototype, 'getUserByMail').mockResolvedValue(new User(1, 'test@example.com', 'testuser', 'hashedPassword', 'player'));

            await AuthController.register(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email already taken' });
        });

        it('should return 201 on successful registration', async () => {
            req.body = { email: 'newuser@example.com', username: 'newuser', password: 'password123', passwordConfirm:'password123' };
            jest.spyOn(UserDAO.prototype, 'getUserByMail').mockResolvedValue(null);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
            jest.spyOn(UserDAO.prototype, 'createUser').mockResolvedValue();

            await AuthController.register(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Account created successfully',
                user: { email: 'newuser@example.com', username: 'newuser' },
            });
        });
    });

    // describe('refreshToken', () => {
    //     it('should return 400 if refresh token is missing', async () => {
    //         req.body = {};
    //         await AuthController.refreshToken(req as Request, res as Response);

    //         expect(res.status).toHaveBeenCalledWith(400);
    //         expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token required' });
    //     });

    //     it('should return 200 with a new access token on valid refresh token', async () => {
    //         req.body = { token: 'validRefreshToken' };
    //         jest.spyOn(jwt, 'verify').mockImplementation(() => ({ userId: 1 }));
    //         jest.spyOn(jwt, 'sign').mockImplementation(() => 'newAccessToken');

    //         await AuthController.refreshToken(req as Request, res as Response);

    //         expect(res.status).toHaveBeenCalledWith(200);
    //         expect(res.json).toHaveBeenCalledWith({ accessToken: 'newAccessToken' });
    //     });

    //     it('should return 401 if refresh token is invalid or expired', async () => {
    //         req.body = { token: 'invalidToken' };
    //         jest.spyOn(jwt, 'verify').mockImplementation(() => {
    //             throw new Error('Invalid token');
    //         });

    //         await AuthController.refreshToken(req as Request, res as Response);

    //         expect(res.status).toHaveBeenCalledWith(401);
    //         expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired refresh token' });
    //     });
    // });
});
