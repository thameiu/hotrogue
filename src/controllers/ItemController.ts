import { ItemDAO } from "../dao/ItemDAO";
import { StockDAO } from "../dao/StockDAO";
import { initDB } from "../db/db";
import { CreateItemDto } from "../dto/item/create-item.dto";
import { Game } from "../models/Game";
import { Item } from "../models/Item";
import { Request, Response } from "express";
import { Stock } from "../models/Stock";

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

    //TODO : modifier la fct pour qu'elle puisse donner + d'un item par point
    //TODO : monter les maxQuantity des items

    static async getRewards(game: Game) {
        const db = await initDB();
        const itemDAO = new ItemDAO(db);
        const items = await itemDAO.getItems();
        const rewards: Item[] = [];
        let rarity = 0;
    
        if (items) {
            for (let i = 0; i < game.score; i++) {
                rarity = Math.floor(Math.random() * 100);
                for (let j = 0; j < items.length; j++) {
                    if (items[j].rarity >= rarity) {
                        const rewardCount = rewards.filter(reward => reward.itemId === items[j].itemId).length;
                        if (rewardCount < items[j].maxQuantity) {
                            rewards.push(items[j]);
                            break;
                        }
                    }
                }
            }
        }
    
        const stockDAO = new StockDAO(db);
    
        for (const reward of rewards) {
            const existingStock = await stockDAO.getStockByUserAndItem(game.user, reward.itemId);
    
            if (existingStock) {
                existingStock.quantity += 1;
    
                if (existingStock.quantity > reward.maxQuantity) {
                    existingStock.quantity = reward.maxQuantity;
                }
    
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

}
    


