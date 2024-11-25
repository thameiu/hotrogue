import { Request, Response } from "express";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { UserDAO } from "../dao/UserDAO";
import { User } from "../models/User";
import { initDB } from "../db/db";
import bcrypt from 'bcrypt';
import { StartGameDto } from "../dto/game/start-game.dto";
import { Game } from "../models/Game";
import { AuthController } from "./AuthController";
import { GameDAO } from "../dao/GameDAO";

export class GameController {
    private static nextId = 1;

    static async startGame(req: Request, res: Response): Promise<Response> {
        try {
          
            const startGameDto = StartGameDto.fromRequest(req.body);

            const user = await AuthController.getUserByToken(req);
            
            if (!user) return res.status(401).json({ message: 'Invalid token' });

            const db = await initDB();
            const gameDAO = new GameDAO(db);
            const game = await gameDAO.getOngoingGame(user.id);

            if (game) return res.status(400).json({ error: "You already have an ongoing game" });

            const newGame = new Game(
                GameController.nextId++, 
                user.id,
                0,
                startGameDto.category,
                "ongoing",
            );
      
            await gameDAO.createGame(newGame);


            return res.status(201).json({
                message: "Game started succesfully ! Toss a coin !",
                gameId: newGame.gameId,
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }

    // static async getOngoingGame(req:Request,res:Response): Promise<Game|null> {
    //     try {
          

    //         const db = await initDB();
    //         const gameDAO = new GameDAO(db);
      
    //         const game = await gameDAO.getOngoingGame(userId);
                
    //         return game;
    //     } catch (error: Error | any) {
    //         if (error instanceof Error) {
    //             return res.status(400).json({ error: error.message });
    //         }
    //         return res.status(400).json({ error: "An unknown error occurred" });
    //     }
    // }

    static async coinToss(req: Request, res: Response): Promise<Response> {
        try {
          
            const startGameDto = StartGameDto.fromRequest(req.body);

            const user = await AuthController.getUserByToken(req);
            
            if (!user) return res.status(401).json({ message: 'Invalid token' });

            const newGame = new Game(
                GameController.nextId++, 
                user.id,
                0,
                startGameDto.category,
                "ongoing",
            );

            const db = await initDB();
            const gameDAO = new GameDAO(db);
      
            await gameDAO.createGame(newGame);


            return res.status(201).json({
                message: "Game started succesfully ! Toss a coin !",
                gameId: newGame.gameId,
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }

}