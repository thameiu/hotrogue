import { ItemDAO } from "../dao/ItemDAO";
import { StockDAO } from "../dao/StockDAO";
import { initDB } from "../db/db";
import { CreateItemDto } from "../dto/item/create-item.dto";
import { Game } from "../models/Game";
import { Item } from "../models/Item";
import { Request, Response } from "express";
import { Stock } from "../models/Stock";
import { AuthController } from "./AuthController";
import { GameItemDAO } from "../dao/GameItemDAO";
import { GameItem } from "../models/GameItem";

export class ItemController {

    static async createItem(req: Request, res: Response): Promise<Response> {
        try {

            const createItemDto = CreateItemDto.fromRequest(req.body);

            const newItem = new Item(
                createItemDto.itemId,
                createItemDto.name,
                createItemDto.description,
                createItemDto.rarity,
                createItemDto.maxQuantity
            );

            const db = await initDB();
            const itemDAO = new ItemDAO(db);

            await itemDAO.createItem(newItem);

            return res.status(201).json({
                message: "Item created successfully",
                user: newItem,
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(400).json({ error: "An unknown error occurred" });
        }
    }

    static async getItemById(itemId: string): Promise<any | null> {
        // return await this.itemDAO.getItemById(itemId);
    }

    static async getRewards(game: Game) {
        const db = await initDB();
        const itemDAO = new ItemDAO(db);
        const items = await itemDAO.getItems();
        const rewards: Item[] = [];
        const itemCountMap: Record<string, number> = {}; 
    
        if (items && items.length > 0) {
            
            for (let i = 0; i < game.score; i++) {
                
                const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    
                for (const item of shuffledItems) {
                    const rarity = Math.floor(Math.random() * 100);
                    if (item.rarity >= rarity) {
                        
                        const currentCount = itemCountMap[item.itemId] || 0;
                        const remainingCapacity = item.maxQuantity - currentCount;
    
                        if (remainingCapacity > 0) {
                            const randomQuantity = Math.min(
                                Math.floor(Math.random() * remainingCapacity) + 1,
                                remainingCapacity
                            );
    
                            for (let q = 0; q < randomQuantity; q++) {
                                rewards.push(item);
                            }
    
                            itemCountMap[item.itemId] = currentCount + randomQuantity;
                        }
                        break;
                    }
                }
            }
        }
    
        const stockDAO = new StockDAO(db);
    
        for (const reward of rewards) {
            const existingStock = await stockDAO.getStockByUserAndItem(game.user, reward.itemId);
    
            if (existingStock) {
                existingStock.quantity += 1;
                await stockDAO.updateStock(existingStock);
            } else {
                const stock = new Stock(reward.itemId, game.user, 1);
                await stockDAO.createStock(stock);
            }
        }
    
        
        return rewards.reduce((acc: { name: string, description: string, quantity: number }[], reward) => {
            const existing = acc.find((item) => item.name === reward.name);
            if (existing) {
                existing.quantity += 1;
            } else {
                acc.push({
                    name: reward.name,
                    description: reward.description,
                    quantity: 1,
                });
            }
            return acc;
        }, []);
    }
    
    
    static async getUserStocks(userId: number): Promise<{ item: string; quantity: number }[]> {
        try {
            const db = await initDB();
            const stockDAO = new StockDAO(db);
            
            const stocks = await stockDAO.getAllStocksByUser(userId);
    
            // Format the stocks
            const formattedStocks = await Promise.all(stocks.map(async (stock) => ({
                item: await ItemController.formatItemName(stock.item), // Map or format the name
                quantity: stock.quantity,
            })));
            return formattedStocks;
        } catch (error: Error | any) {
            throw new Error(error.message);
        }
    }


        static async getUserInventory(req: Request, res: Response): Promise<Response> {
            try {
                const user = await AuthController.getUserByToken(req);
                if (user?.id !== undefined) {
                    const inventory = await ItemController.getUserInventoryById(user.id);
                    return res.status(200).json(inventory);
                } else {
                    return res.status(400).json({ error: "User ID is undefined" });
                }
            } catch (error: Error | any) {
                return res.status(400).json({ error: error.message });
            }
        }

        private static async getUserInventoryById(userId: number): Promise<{ name: string; description: string; quantity: number }[]> {
            try {
                const db = await initDB();
                const stockDAO = new StockDAO(db);
                const itemDAO = new ItemDAO(db);
                
                const stocks = await stockDAO.getAllStocksByUser(userId);
                const inventory: { name: string; description: string; quantity: number }[] = [];
                
                for (const stock of stocks) {
                    const item = await itemDAO.getItemById(stock.item);
                    if (item) {
                        const existing = inventory.find((invItem) => invItem.name === item.name);
                        if (existing) {
                            existing.quantity += stock.quantity;
                        } else {
                            inventory.push({
                                name: item.name,
                                description: item.description,
                                quantity: stock.quantity,
                            });
                        }
                    }
                }
                
                return inventory;
            } catch (error: Error | any) {
                throw new Error(error.message);
            }
        }

    // Utility function to format item names if they aren't in the map
    static async formatItemName(itemId: string): Promise<string> {
        const db = await initDB();
        const itemDAO = new ItemDAO(db);
        const item = await itemDAO.getItemById(itemId);
        return item ? item.name : itemId;
    }

    static async getGameItems(gameId:number): Promise<GameItem[]>{
        const db = await initDB();
        const gameItemDAO = new GameItemDAO(db);
        const gameItems = await gameItemDAO.getAllGameItemsByGame(gameId);
        return gameItems;
    }
    
    static async getGameItemByItem(gameId:number, itemId:string): Promise<GameItem | null>{
        const db = await initDB();
        const gameItemDAO = new GameItemDAO(db);
        const gameItem = await gameItemDAO.getGameItemByGameAndItem(gameId, itemId);
        return gameItem;
    }
    
}
    


