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
import { ItemController } from "./ItemController";
import { StockDAO } from "../dao/StockDAO";

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

    static async tossCoin(req: Request, res: Response): Promise<Response> {
        try {
            const user = await AuthController.getUserByToken(req);
    
            if (!user) return res.status(401).json({ message: "Invalid token" });
    
            const guess = req.body.guess?.toLowerCase();
            if (!["heads", "tails"].includes(guess)) {
                return res.status(400).json({ error: "Guess must be either 'heads' or 'tails'" });
            }
    
            const db = await initDB();
            const stockDAO = new StockDAO(db);
            const gameDAO = new GameDAO(db);
    
            const game = await gameDAO.getOngoingGame(user.id);
            if (!game) {
                return res.status(404).json({ error: "No ongoing game found" });
            }
            
            const items = req.body.items;
            
            const totalLeads = (items?.lead?.quantity || 0) + (items?.heavyLead?.quantity || 0) * 2;
    
            if (totalLeads > 5) { // Maximum 5 leads can be used
                return res.status(400).json({ error: "You can only use up to 5 leads in total (including heavyLeads)" });
            }
    
            const leadWeight = await GameController.calculateWeight("lead", items?.lead, user, stockDAO, 0.05);
            const heavyLeadWeight = await GameController.calculateWeight("heavyLead", items?.heavyLead, user, stockDAO, 0.10);
    
            const totalWeight = leadWeight + heavyLeadWeight;
    
            const coinResult = GameController.getWeightedResult(guess, totalWeight, items?.lead?.side, items?.heavyLead?.side);
    
            if (guess === coinResult) { // The game continues, one item of each type used is consumed
                
                game.score += 1;
                await gameDAO.updateGame(game);
    
                if (items?.lead?.quantity) {
                    const userStock = await stockDAO.getStockByUserAndItem(user.id, "lead");
                    if (userStock) {
                        userStock.quantity -= 1; 
                        await stockDAO.updateStock(userStock);
                    }
                }
                if (items?.heavyLead?.quantity) {
                    const userStock = await stockDAO.getStockByUserAndItem(user.id, "heavyLead");
                    if (userStock) {
                        userStock.quantity -= 1; 
                        await stockDAO.updateStock(userStock);
                    }
                }
    
                return res.status(200).json({
                    message: "You guessed correctly! Toss again!",
                    coinResult,
                    score: game.score,
                });
            } else { // You lose, every item on the coin is lost
                
                game.status = "finished";
                await gameDAO.updateGame(game);
    
                const rewards = await ItemController.getRewards(game);
    
                if (items?.lead?.quantity) {
                    const userStock = await stockDAO.getStockByUserAndItem(user.id, "lead");
                    if (userStock) {
                        userStock.quantity -= items?.lead?.quantity; 
                        await stockDAO.updateStock(userStock);
                    }
                }
                if (items?.heavyLead?.quantity) {
                    const userStock = await stockDAO.getStockByUserAndItem(user.id, "heavyLead");
                    if (userStock) {
                        userStock.quantity -= items?.heavyLead?.quantity;
                        await stockDAO.updateStock(userStock);
                    }
                }
    
                return res.status(200).json({
                    message: "You guessed wrong! Game over.",
                    coinResult,
                    finalScore: game.score,
                    rewards,
                });
            }
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }
    
    static async calculateWeight(
        itemName: string,
        itemData: { quantity: number; side: string } | undefined,
        user: User,
        stockDAO: StockDAO,
        weightPerItem: number
    ): Promise<number> {
        if (!itemData || itemData.quantity <= 0) return 0;
    
        const userStock = await stockDAO.getStockByUserAndItem(user.id, itemName);
    
        if (!userStock || userStock.quantity < itemData.quantity) {
            throw new Error(`Insufficient ${itemName} in stock`);
        }
    
        const side = itemData.side?.toLowerCase();
        if (!["heads", "tails"].includes(side)) {
            throw new Error(`Invalid side for ${itemName}. Must be 'heads' or 'tails'.`);
        }
    
        return itemData.quantity * weightPerItem;
    }
    
    static getWeightedResult(
        guess: string,
        totalWeight: number,
        leadSide: string | undefined,
        heavyLeadSide: string | undefined
    ): string {
        let baseProbability = 0.5;
    
        if (leadSide === "heads") {
            baseProbability += 0.05;
        } else if (leadSide === "tails") {
            baseProbability -= 0.05;
        }
    
        if (heavyLeadSide === "heads") {
            baseProbability += 0.12;
        } else if (heavyLeadSide === "tails") {
            baseProbability -= 0.12;
        }
    
        baseProbability = Math.min(Math.max(baseProbability, 0), 1);
    
        return Math.random() < baseProbability ? "heads" : "tails";
    }

}