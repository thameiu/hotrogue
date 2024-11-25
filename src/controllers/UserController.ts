import { Request, Response } from "express";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserDAO } from "../dao/UserDAO";
import { User } from "../models/User";
import { initDB } from "../db/db";
import bcrypt from 'bcrypt';

export class UserController {
    private static nextId = 1; // Simulate auto-incrementing ID

    static async createUser(req: Request, res: Response): Promise<Response> {
        try {
          
            const createUserDto = CreateUserDto.fromRequest(req.body);

            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = new User(
                UserController.nextId++, // Auto-increment ID
                createUserDto.email,
                createUserDto.username,
                hashedPassword// Hashing should be added here
            );

            const db = await initDB();
            const userDAO = new UserDAO(db);
      
            await userDAO.createUser(newUser);

            return res.status(201).json({
                message: "User created successfully",
                user: newUser,
            });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

}
