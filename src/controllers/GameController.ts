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
import { GameItem } from "../models/GameItem";
import { GameItemDAO } from "../dao/GameItemDAO";
import { Stock } from "../models/Stock";

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
                user: user.username
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
            baseProbability -= 0.07;
        } else if (leadSide === "tails") {
            baseProbability += 0.07;
        }
    
        if (heavyLeadSide === "heads") {
            baseProbability -= 0.16;
        } else if (heavyLeadSide === "tails") {
            baseProbability += 0.16;
        }
    
        baseProbability = Math.min(Math.max(baseProbability, 0), 1);
    
        return Math.random() < baseProbability ? "heads" : "tails";
    }


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
            const gameItemDAO = new GameItemDAO(db);
    
            const game = await gameDAO.getOngoingGame(user.id);
            if (!game) {
                return res.status(404).json({ error: "No ongoing game found" });
            }
    
            const items = req.body.items;
    
            if (items?.genieCoin){
                if (items?.miteCoin || items?.cheaterCoin) {
                    return res.status(400).json({ error: "You can only use one special coin at a time." });
                }
                return GameController.genieCoinToss(req,res,user,game,gameDAO,stockDAO,gameItemDAO,guess);
            }

            if (items?.cheaterCoin){
                if (items?.miteCoin || items?.genieCoin) {
                    return res.status(400).json({ error: "You can only use one special coin at a time." });
                }
                return GameController.cheaterCoinToss(req,res,user,game,gameDAO,stockDAO,gameItemDAO,guess);
            }


            const totalLeads = (items?.lead?.quantity || 0) + (items?.heavyLead?.quantity || 0) * 2;
    
            if (totalLeads > 5) {
                return res.status(400).json({ error: "You can only use up to 5 leads in total (including heavyLeads)" });
            }
    
            const leadWeight = await GameController.calculateWeight("lead", items?.lead, user, stockDAO, 0.05);
            const heavyLeadWeight = await GameController.calculateWeight("heavyLead", items?.heavyLead, user, stockDAO, 0.10);
    
            const totalWeight = leadWeight + heavyLeadWeight;
    
            const coinResult = GameController.getWeightedResult(guess, totalWeight, items?.lead?.side, items?.heavyLead?.side);
    
            
            const existingSpring = await gameItemDAO.getGameItemByGameAndItem(game.gameId, "spring");
            const userSpringStock = await stockDAO.getStockByUserAndItem(user.id, "spring");

            if (items?.spring){
                if (!userSpringStock || userSpringStock.quantity < 1) {
                    return res.status(400).json({ error: "You don't have any springs in your inventory." });
                }
                if (existingSpring && existingSpring.quantity > 0) {
                    return res.status(400).json({ error: "You can only use one spring per game.",message:existingSpring });
                }
                if (!existingSpring) {
                    const newSpringGameItem = new GameItem("spring", game.gameId, 0);
                    console.log(newSpringGameItem);
                    await gameItemDAO.createGameItem(newSpringGameItem);
                }
            }

            // If guess is correct
            if (guess === coinResult) {
                return GameController.correctGuess(req,res,user,game,gameDAO,stockDAO,coinResult);
            }
    
            // If guess is incorrect and spring is used
            if (items?.spring && userSpringStock ) {
                return GameController.springSave(req,res,user,userSpringStock,existingSpring,game,gameDAO,stockDAO,gameItemDAO,coinResult);
            }
    
            // If guess is incorrect and no spring is used
            return GameController.wrongGuess(req,res,user,game,gameDAO,stockDAO,gameItemDAO,coinResult);

        } catch (error: Error | any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async correctGuess(req:Request,res:Response,user:User,game:Game,gameDAO:GameDAO,stockDAO:StockDAO,coinResult:string):Promise<Response>{
        game.score += 1;
        await gameDAO.updateGame(game);
        const items = req.body.items;
        
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

        const rewards = await ItemController.getRoundReward(game);
        const ennemy = await ItemController.spawnEnnemy(game);
        const inventory = await ItemController.getUserStocks(user.id);

        return res.status(200).json({
            message: "You guessed correctly! Toss again!",
            coinResult,
            score: game.score,
            rewards:rewards?rewards:'no rewards',
            ...(ennemy && { ennemy }),
            inventory,
        });
    }

    static async springSave(req:Request,res:Response,user:User,userSpringStock:Stock,existingSpring:GameItem|null,game:Game,gameDAO:GameDAO,stockDAO:StockDAO,gameItemDAO:GameItemDAO,coinResult:string):Promise<Response>{
        userSpringStock.quantity -= 1;
        await stockDAO.updateStock(userSpringStock);

        if (existingSpring) {
            existingSpring.quantity = 1;
            await gameItemDAO.updateGameItem(existingSpring);
        }

        const rewards = await ItemController.getRoundReward(game);
        const inventory = await ItemController.getUserStocks(user.id);

        return res.status(200).json({
            message: "You guessed wrong, but your spring saved you! Toss again!",
            coinResult,
            score: game.score,
            rewards,
            inventory,
        });
    }

    static async wrongGuess(req:Request,res:Response,user:User,game:Game,gameDAO:GameDAO,stockDAO:StockDAO,gameItemDAO:GameItemDAO,coinResult:string):Promise<Response>{
        game.status = "finished";
        await gameDAO.updateGame(game);
        const items = req.body.items;

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

        const rewards = await ItemController.getRewards(game);

        const leadMiteStock = await stockDAO.getStockByUserAndItem(user.id, "leadmite");
        if (leadMiteStock) {
            leadMiteStock.quantity = 0;
            await stockDAO.updateStock(leadMiteStock);
        }

        const heavyLeadMiteStock = await stockDAO.getStockByUserAndItem(user.id, "heavyLeadmite");
        if (heavyLeadMiteStock) {
            heavyLeadMiteStock.quantity = 0;
            await stockDAO.updateStock(heavyLeadMiteStock);
        }

        const leadMiteQueenStock = await stockDAO.getStockByUserAndItem(user.id, "leadmiteQueen");
        if (leadMiteQueenStock) {
            leadMiteQueenStock.quantity = 0;
            await stockDAO.updateStock(leadMiteQueenStock);
        }

        const usedItems = await gameItemDAO.getAllGameItemsByGame(game.gameId);
        return res.status(200).json({
            message: "You guessed wrong! Game over.",
            coinResult,
            finalScore: game.score,
            rewards:rewards?rewards:'no rewards',
            usedItems:usedItems?usedItems:'no used items',
        });
    }

    static async genieCoinToss(req:Request,res:Response,user:User,game:Game,gameDAO:GameDAO,stockDAO:StockDAO,gameItemDAO:GameItemDAO,guess:string):Promise<Response>{
        const usedGenieCoin = await gameItemDAO.getGameItemByGameAndItem(game.gameId, "genieCoin");
        const userGenieCoinStock = await stockDAO.getStockByUserAndItem(user.id, "genieCoin");

        if (!userGenieCoinStock || userGenieCoinStock.quantity < 1) {
            return res.status(400).json({ error: "You don't have any genie coins in your inventory." });
        }
        userGenieCoinStock.quantity -= 1;
        await stockDAO.updateStock(userGenieCoinStock);

        if (usedGenieCoin) {
            usedGenieCoin.quantity += 1;
            await gameItemDAO.updateGameItem(usedGenieCoin);
        } else {
            const newGenieCoinGameItem = new GameItem("genieCoin", game.gameId, 1);
            await gameItemDAO.createGameItem(newGenieCoinGameItem);
        }
        
        const coinResult = Math.random() < 0.5 ? "heads" : "tails";

        if (guess === coinResult) {
            game.score *= 2;
        } else {
            game.score = Math.floor(game.score / 2);
        }

        await gameDAO.updateGame(game);

        const rewards = await ItemController.getRoundReward(game);
        const inventory = await ItemController.getUserStocks(user.id);

        return res.status(200).json({
            message: guess === coinResult ? "You guessed correctly! Score doubled!" : "You guessed wrong! Score halved!",
            coinResult,
            score: game.score,
            rewards:rewards?rewards:'no rewards',
            inventory,
        });
    }

    static async cheaterCoinToss(req:Request,res:Response,user:User,game:Game,gameDAO:GameDAO,stockDAO:StockDAO,gameItemDAO:GameItemDAO,guess:string):Promise<Response>{
        const usedCheaterCoin = await gameItemDAO.getGameItemByGameAndItem(game.gameId, "cheaterCoin");
        const userCheaterCoinStock = await stockDAO.getStockByUserAndItem(user.id, "cheaterCoin");

        if (!userCheaterCoinStock || userCheaterCoinStock.quantity < 1) {
            return res.status(400).json({ error: "You don't have any cheater coins in your inventory." });
        }

        userCheaterCoinStock.quantity -= 1;
        await stockDAO.updateStock(userCheaterCoinStock);

        if (usedCheaterCoin) {
            usedCheaterCoin.quantity += 1;
            await gameItemDAO.updateGameItem(usedCheaterCoin);
        } else {
            const newCheaterCoinGameItem = new GameItem("cheaterCoin", game.gameId, 1);
            await gameItemDAO.createGameItem(newCheaterCoinGameItem);
        }

        const coinResult = Math.random() < 0.9 ? guess : (guess === "heads" ? "tails" : "heads");
        
        if (guess === coinResult) {
            game.score += 2;
        } else {
            game.score = game.score >= 10 ? game.score - 10 : 0;
        }

        await gameDAO.updateGame(game);

        const inventory = await ItemController.getUserStocks(user.id);

        return res.status(200).json({
            message: guess === coinResult ? "You guessed correctly! 2 points!" : "You guessed wrong! -10 points!",
            coinResult,
            score: game.score,
            inventory,
        });
    }

}