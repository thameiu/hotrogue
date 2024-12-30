import { Request, Response } from "express";
import { CreateUserDto } from "../../dto/user/create-user.dto";
import { UserDAO } from "../../dao/UserDAO";
import { User } from "../../models/User";
import { initDB } from "../../db/db";
import bcrypt from 'bcrypt';
import { StartGameDto } from "../../dto/game/start-game.dto";
import { Game } from "../../models/Game";
import { AuthController } from "../auth/AuthController.controller";
import { GameDAO } from "../../dao/GameDAO";
import { ItemController } from "../item/ItemController.controller";
import { StockDAO } from "../../dao/StockDAO";
import { GameItem } from "../../models/GameItem";
import { GameItemDAO } from "../../dao/GameItemDAO";
import { Stock } from "../../models/Stock";

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
    
    static async checkQuantity(
        itemName: string,
        itemData: { quantity: number; side: string } | undefined,
        user: User,
        stockDAO: StockDAO,
    ) {
        if (!itemData || itemData.quantity <= 0) return 0;
    
        const userStock = await stockDAO.getStockByUserAndItem(user.id, itemName);
    
        if (!userStock || userStock.quantity < itemData.quantity) {
            throw new Error(`Insufficient ${itemName} in stock`);
        }
    
        const side = itemData.side?.toLowerCase();
        if (!["heads", "tails"].includes(side)) {
            throw new Error(`Invalid side for ${itemName}. Must be 'heads' or 'tails'.`);
        }
    
        return 0;
    }
    
    static async getWeightedResult(
        guess: string,
        stockDAO: StockDAO,
        user: User,
        lead: { quantity: number; side: string } | undefined,
        heavyLead: { quantity: number; side: string } | undefined,
        leadmite: { quantity: number; side: string } | undefined,
        heavyLeadmite: { quantity: number; side: string } | undefined,
        leadmiteQueen: { quantity: number; side: string } | undefined,
    ): Promise<string> {


        let baseProbability = 0.5;
    
        if (lead?.side === "heads") {
            baseProbability -= 0.07*lead?.quantity;
        } else if (lead?.side === "tails") {
            baseProbability += 0.07*lead?.quantity;
        }
    
        if (heavyLead?.side === "heads") {
            baseProbability -= 0.16*heavyLead?.quantity;
        } else if (heavyLead?.side === "tails") {
            baseProbability += 0.16*heavyLead?.quantity;
        }

        if (leadmite?.side === "heads") {
            baseProbability -= 0.04*leadmite?.quantity;
        } else if (leadmite?.side === "tails") {
            baseProbability += 0.04*leadmite?.quantity;
        }

        if (heavyLeadmite?.side === "heads") {
            baseProbability -= 0.10*heavyLeadmite?.quantity;
        } else if (heavyLeadmite?.side === "tails") {
            baseProbability += 0.10*heavyLeadmite?.quantity;
        }
        baseProbability = Math.min(Math.max(baseProbability, 0), 1);
        console.log(baseProbability);
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

            await GameController.checkQuantity('lead', items?.lead, user, stockDAO);
            await GameController.checkQuantity('heavyLead', items?.heavyLead, user, stockDAO);
            await GameController.checkQuantity('leadmite', items?.leadmite, user, stockDAO);
            await GameController.checkQuantity('heavyLeadmite', items?.heavyLeadmite, user, stockDAO);
            await GameController.checkQuantity('leadmiteQueen', items?.leadmiteQueen, user, stockDAO);

            const totalLeads = (items?.lead?.quantity || 0) + (items?.heavyLead?.quantity || 0) * 2;
    
            if (totalLeads > 5) {
                return res.status(400).json({ error: "You can only use up to 5 leads in total (including heavyLeads)" });
            }

            if ((items?.lead?.side === items?.leadmite?.side || items?.heavyLead?.side === items?.heavyLeadmite?.side || 
                items?.heavyLead?.side === items?.leadmite?.side || items?.lead?.side === items?.heavyLeadmite?.side)
                && ((items?.lead?.quantity || items?.heavyLead?.quantity) > 0 && (items?.leadmite?.quantity || items?.heavyLeadmite?.quantity) > 0)
            ) {
                    return res.status(400).json({ error: "You can't place leadmites on the same side as leads." });
                }
            const coinResult = await GameController.getWeightedResult(guess, stockDAO, user, items?.lead, items?.heavyLead, items?.leadmite, items?.heavyLeadmite, items?.leadmiteQueen);
    
            
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
        

    static async correctGuess(
        req: Request,
        res: Response,
        user: User,
        game: Game,
        gameDAO: GameDAO,
        stockDAO: StockDAO,
        coinResult: string
    ): Promise<Response> {
        game.score += 1;
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
    
        let ennemyInfo = "";
    
        if (items?.leadmite?.quantity && items?.leadmite?.quantity >= 1) {
            const userStock = await stockDAO.getStockByUserAndItem(user.id, "leadmite");
            if (userStock) {
                const eliminatedLeadmites = Math.min(userStock.quantity, items.leadmite.quantity);
                userStock.quantity -= eliminatedLeadmites;
                game.score += eliminatedLeadmites * 2; 
                await stockDAO.updateStock(userStock);
                ennemyInfo += `You got rid of ${eliminatedLeadmites} leadmite${eliminatedLeadmites>1?'s':''}! `;
            }
        }

        if (items?.heavyLeadmite?.quantity && items?.heavyLeadmite?.quantity >= 1) {
            const userStock = await stockDAO.getStockByUserAndItem(user.id, "heavyLeadmite");
            if (userStock) {
                const eliminatedLeadmites = Math.min(userStock.quantity, items.heavyLeadmite.quantity);
                userStock.quantity -= eliminatedLeadmites;
                game.score += eliminatedLeadmites * 3; 
                await stockDAO.updateStock(userStock);
                ennemyInfo += `You got rid of ${eliminatedLeadmites} heavy leadmite(s)! `;
            }
        }
        
        await gameDAO.updateGame(game);
    
        const leadmiteMessage = await ItemController.handleLeadmites(user, stockDAO);
    
        const rewards = await ItemController.getRoundReward(game);
        const ennemy = await ItemController.spawnEnnemy(game);
        const inventory = await ItemController.getUserStocks(user.id);
    
        return res.status(200).json({
            message: `You guessed correctly! Toss again! ${ennemyInfo} ${leadmiteMessage}`,
            coinResult,
            score: game.score,
            rewards: rewards ? rewards : "no rewards",
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

        
        const leadmiteMessage = await ItemController.handleLeadmites(user, stockDAO);

        const rewards = await ItemController.getRoundReward(game);
        const ennemy = await ItemController.spawnEnnemy(game);
        const inventory = await ItemController.getUserStocks(user.id);

        return res.status(200).json({
            message: "You guessed wrong, but your spring saved you! Toss again! "+leadmiteMessage,
            coinResult,
            score: game.score,
            rewards,
            ...(ennemy && { ennemy }),
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

        const leadmiteMessage = await ItemController.handleLeadmites(user, stockDAO);

        const rewards = await ItemController.getRoundReward(game);
        const ennemy = await ItemController.spawnEnnemy(game);
        const inventory = await ItemController.getUserStocks(user.id);


        return res.status(200).json({
            message: guess === coinResult ? "You guessed correctly! Score doubled! "+leadmiteMessage : "You guessed wrong! Score halved! "+leadmiteMessage,
            coinResult,
            score: game.score,
            rewards:rewards?rewards:'no rewards',
            ...(ennemy && { ennemy }),
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

        const leadmiteMessage = await ItemController.handleLeadmites(user, stockDAO);

        const rewards = await ItemController.getRoundReward(game);
        const ennemy = await ItemController.spawnEnnemy(game);
        const inventory = await ItemController.getUserStocks(user.id);

        return res.status(200).json({
            message: guess === coinResult ? "You guessed correctly! 2 points!" : "You guessed wrong! -10 points!",
            coinResult,
            score: game.score,
            rewards:rewards?rewards:'no rewards',
            ...(ennemy && { ennemy }),
            inventory,
        });
    }

    static async getLeaderboard(req: Request, res: Response): Promise<Response> {
        try {
            const db = await initDB();
            const gameDAO = new GameDAO(db);
            const leaderboard = await gameDAO.getLeaderboard();
            return res.status(200).json(leaderboard);
        } catch (error: Error | any) {
            return res.status(400).json({ error: error.message });
        }
    }

}