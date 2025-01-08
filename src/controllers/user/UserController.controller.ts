import { Request, Response } from "express";
import { CreateUserDto } from "../../dto/user/create-user.dto";
import { UserDAO } from "../../dao/UserDAO";
import { User } from "../../models/User";
import { initDB } from "../../db/db";
import bcrypt from 'bcrypt';

export class UserController {
    private static nextId = 1;

    static async createUser(req: Request, res: Response): Promise<Response> {

        try {

            const createUserDto = CreateUserDto.fromRequest(req.body);

            if (createUserDto instanceof Error) {
                return res.status(400).json({ message: createUserDto.message });
            }

            const db = await initDB();
            const userDAO = new UserDAO(db);
    
            
            const existingUser = await userDAO.getUserByMail(createUserDto.email);
            if (existingUser) {
                return res.status(409).json({ error: "E-mail is already taken" });
            }
    
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = new User(
                UserController.nextId++, 
                createUserDto.email,
                createUserDto.username,
                hashedPassword,
                createUserDto.role
            );
    
            await userDAO.createUser(newUser);
    
            return res.status(201).json({
                message: "User created successfully",
                user: { 
                    id: newUser.id, 
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

    static async setAdmin(req: Request, res: Response): Promise<Response> {
        try {
            const { username } = req.params;

            if (!username) {
                return res.status(400).json({ message: "Username is required" });
            }

            const db = await initDB();
            const userDAO = new UserDAO(db);

            const user = await userDAO.getUserByUsername(username);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.role === "admin") {
                user.role = "player";
                await userDAO.updateUser(user);

                return res.status(200).json({
                    message: `User ${username} has been demoted to player`,
                    user: { id: user.id, username: user.username, role: user.role },
                });
            }
                
            user.role = "admin";
            await userDAO.updateUser(user);

            return res.status(200).json({
                message: `User ${username} has been granted admin privileges`,
                user: { id: user.id, username: user.username, role: user.role },
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }
    

    static async banUser(req: Request, res: Response): Promise<Response> {
        try {
            const { username } = req.params;
    
            if (!username) {
                return res.status(400).json({ message: "Username is required" });
            }
    
            const db = await initDB();
            const userDAO = new UserDAO(db);
    
            const user = await userDAO.getUserByUsername(username);
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.role === "admin" || user.role === "superadmin") {
                return res.status(400).json({
                    message: `User ${username} is an admin and cannot be banned`,
                    user: { id: user.id, username: user.username, role: user.role },
                });
            }
    
            if (user.role === "banned") {
                user.role = "player";
                await userDAO.updateUser(user);
                return res.status(200).json({
                    message: `User ${username} has been unbanned`,
                    user: { id: user.id, username: user.username, role: user.role },
                });
            }
    
            user.role = "banned";
            await userDAO.updateUser(user);
    
            return res.status(200).json({
                message: `User ${username} has been banned`,
                user: { id: user.id, username: user.username, role: user.role },
            });
            
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }
    
}
