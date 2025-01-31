import { ItemDAO } from "../../dao/ItemDAO";
import { StockDAO } from "../../dao/StockDAO";
import { initDB } from "../../db/db";
import { CreateItemDto } from "../../dto/item/create-item.dto";
import { Game } from "../../models/Game";
import { Item } from "../../models/Item";
import { Request, Response } from "express";
import { Stock } from "../../models/Stock";
import { AuthController } from "../auth/AuthController.controller";
import { GameItemDAO } from "../../dao/GameItemDAO";
import { GameItem } from "../../models/GameItem";
import { Responses } from "swagger-jsdoc";
import { User } from "../../models/User";
import { UpdateItemDto } from "../../dto/item/update-item.dto";
import { UserDAO } from "../../dao/UserDAO";

export class ItemController {

    static async createItem(req: Request, res: Response): Promise<Response> {

        try {
            const createItemDto = CreateItemDto.fromRequest(req.body);
            if (createItemDto instanceof Error) {
                return res.status(400).json({ message: createItemDto.message });
            }

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

    static async updateItem(req: Request, res: Response): Promise<Response> {
        try {
            const { itemId } = req.params;
            const updateItemDto = UpdateItemDto.fromRequest(req.body);

            if (updateItemDto instanceof Error) {
                return res.status(400).json({ message: updateItemDto.message });
            }

            if (!itemId) {
                return res.status(400).json({ message: "Item ID is required" });
            }

            const db = await initDB();
            const itemDAO = new ItemDAO(db);

            const existingItem = await itemDAO.getItemById(itemId);

            if (!existingItem) {
                return res.status(404).json({ message: "Item not found" });
            }

            const updatedItem = new Item(
                itemId,
                updateItemDto.name? updateItemDto.name : existingItem.name,
                updateItemDto.description? updateItemDto.description : existingItem.description,
                updateItemDto.rarity? updateItemDto.rarity : existingItem.rarity,
                updateItemDto.maxQuantity? updateItemDto.maxQuantity : existingItem.maxQuantity
            );

            await itemDAO.updateItem(updatedItem);

            return res.status(200).json({
                message: "Item updated successfully",
                item: updatedItem,
            });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }

    static async getItems(req: Request, res: Response): Promise<Response> {
        try {
            const db = await initDB();
            const itemDAO = new ItemDAO(db);
            const items = await itemDAO.getItems();
            return res.status(200).json({ items });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }

    static async getItemById(req: Request, res: Response): Promise<Response> {
        try {
            const { itemId } = req.params; 
            
            if (!itemId) {
                return res.status(400).json({ message: "Item ID is required" });
            }
    
            const db = await initDB(); 
            const itemDAO = new ItemDAO(db);
    
            const item = await itemDAO.getItemById(itemId);
    
            if (!item) {
                return res.status(404).json({ message: "Item not found" }); 
            }
    
            return res.status(200).json({ item }); 
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }

    static async deleteItemById(req: Request, res: Response): Promise<Response> {
        try {
            const { itemId } = req.params;
    
            if (!itemId) {
                return res.status(400).json({ message: "Item ID is required" });
            }
    
            const db = await initDB();
            const itemDAO = new ItemDAO(db);
    
            await itemDAO.deleteItemById(itemId);
    
            return res.status(200).json({ message: "Item deleted successfully" });
        } catch (error: Error | any) {
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ error: error.message });
                }
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }

    static async createOrUpdateStock(req: Request, res: Response): Promise<Response> {
        try {
            const { itemId, username, quantity } = req.body;
    
            if (!itemId || !username || !quantity || quantity == 0) {
                return res.status(400).json({
                    message: "itemId, username, and quantity are required. Quantity must be greater or less than 0.",
                });
            }
    
            const db = await initDB();
            const stockDAO = new StockDAO(db);
            const itemDAO = new ItemDAO(db);
            const userDAO = new UserDAO(db); 
    
            const item = await itemDAO.getItemById(itemId);
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }
    
            const user = await userDAO.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const existingStock = await stockDAO.getStockByUserAndItem(username, itemId);
    
            if (existingStock) {
                existingStock.quantity += parseInt(quantity);
                await stockDAO.updateStock(existingStock);
                
                return res.status(200).json({
                    message: "Stock updated successfully",
                    stock: existingStock.quantity>0? existingStock : "Stock deleted successfully",
                });
            } else {
                if (quantity < 0) {
                    return res.status(400).json({
                        message: "Stock not found. Cannot update stock with a negative quantity",
                    });
                }
                const newStock = new Stock(itemId, username, parseInt(quantity));
                await stockDAO.createStock(newStock);
    
                return res.status(201).json({
                    message: "Stock created successfully",
                    stock: newStock,
                });
            }
        } catch (error: Error | any) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }
    
    

    static async getRoundReward(game: Game): Promise<{ name: string; description: string; quantity: number } | null> {
        const db = await initDB();
        const itemDAO = new ItemDAO(db);
        const items = await itemDAO.getItems();
    
        if (!items || items.length === 0) {
            return null; 
        }
        
        const excludedItems = ['leadmite', 'heavyLeadmite', 'leadmiteQueen'];
        const filteredItems = items.filter(item => !excludedItems.includes(item.itemId));

        if (filteredItems.length === 0) {
            return null; 
        }
    
        const shuffledItems = [...filteredItems].sort(() => Math.random() - 0.5);
        const selectedItem = shuffledItems.find((item) => {
            const rarity = Math.floor(Math.random() * 100);
            return item.rarity >= rarity;
        });
    
        if (!selectedItem) {
            return null; 
        }
    
        const stockDAO = new StockDAO(db);
        const existingStock = await stockDAO.getStockByUserAndItem(game.user, selectedItem.itemId);
    
        let dropQuantity = 1;
        for (let i = 1; i < selectedItem.maxQuantity; i++) {
            const randomChance = Math.floor(Math.random() * 100);
            if (randomChance < selectedItem.rarity) {
                dropQuantity += 1;
            }
        }
    
        if (existingStock) {
            existingStock.quantity += dropQuantity;
            await stockDAO.updateStock(existingStock);
        } else {
            const stock = new Stock(selectedItem.itemId, game.user, dropQuantity);
            await stockDAO.createStock(stock);
        }
    
        return {
            name: selectedItem.name,
            description: selectedItem.description,
            quantity: dropQuantity,
        };
    }

    
    static async spawnEnnemy(game: Game): Promise<{ name: string; description: string; quantity: number } | null> {
        const db = await initDB();
        const itemDAO = new ItemDAO(db);
        const items = await itemDAO.getItems();
    
        if (!items || items.length === 0 || game.score < 1) {
            console.log('nonono ennemoies')
            return null; 
        }
    
        const includedEnnemies = ['leadmite', 'heavyLeadmite', 'leadmiteQueen'];
        const ennemies = items.filter(item => includedEnnemies.includes(item.itemId));

        if (ennemies.length === 0) {
            return null; 
        }
    
        // Randomly pick an item
        const shuffledEnnemies = [...ennemies].sort(() => Math.random() - 0.5);
        const selectedEnnemy = shuffledEnnemies.find((item) => {
            const rarity = Math.floor(Math.random() * 100);
            return item.rarity >= rarity;
        });
    
        if (!selectedEnnemy) {
            return null; 
        }
    
        const stockDAO = new StockDAO(db);
        const existingStock = await stockDAO.getStockByUserAndItem(game.user, selectedEnnemy.itemId);
    
        let dropQuantity = 1;
        for (let i = 1; i < selectedEnnemy.maxQuantity; i++) {
            const randomChance = Math.floor(Math.random() * 100);
            if (randomChance < selectedEnnemy.rarity) {
                dropQuantity += 1;
            }
        }
    
        if (existingStock) {
            existingStock.quantity += dropQuantity;
            await stockDAO.updateStock(existingStock);
        } else {
            const stock = new Stock(selectedEnnemy.itemId, game.user, dropQuantity);
            await stockDAO.createStock(stock);
        }
    
        return {
            name: selectedEnnemy.name,
            description: selectedEnnemy.description,
            quantity: dropQuantity,
        };
    }
    
    

    static async getRewards(game: Game) {
        const db = await initDB();
        const itemDAO = new ItemDAO(db);
        const items = await itemDAO.getItems();
        const rewards: Item[] = [];
        const itemCountMap: Record<string, number> = {};
    
        const excludedItems = ['leadmite', 'heavyLeadmite', 'leadmiteQueen'];
    
        if (items && items.length > 0) {
            for (let i = 0; i < game.score; i++) {
                const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    
                for (const item of shuffledItems) {
                    if (excludedItems.includes(item.itemId)) {
                        continue;
                    }
    
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
    
            const formattedStocks = await Promise.all(stocks.map(async (stock) => ({
                item: await ItemController.formatItemName(stock.item), 
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
        
        static async handleLeadmites(
            user: User,
            stockDAO: StockDAO
        ): Promise<string> {
            const leadmiteStock = await stockDAO.getStockByUserAndItem(user.id, "leadmite");
            const heavyLeadmiteStock = await stockDAO.getStockByUserAndItem(user.id, "heavyLeadmite");
        
            let leadmites = leadmiteStock?.quantity || 0;
            let heavyLeadmites = heavyLeadmiteStock?.quantity || 0;
        
            let eatenLeads = 0;
            let eatenHeavyLeads = 0;
        
            if (leadmites > 0) {
                const leadStock = await stockDAO.getStockByUserAndItem(user.id, "lead");
                if (leadStock) {
                    eatenLeads = Math.min(leadmites, leadStock.quantity);
                    leadStock.quantity -= eatenLeads;
                    await stockDAO.updateStock(leadStock);
                }
            }
        
            if (heavyLeadmites > 0) {
                const heavyLeadStock = await stockDAO.getStockByUserAndItem(user.id, "heavyLead");
                if (heavyLeadStock) {
                    eatenHeavyLeads = Math.min(heavyLeadmites, heavyLeadStock.quantity);
                    heavyLeadStock.quantity -= eatenHeavyLeads;
                    await stockDAO.updateStock(heavyLeadStock);
                }
            }
        
            let leadmiteMessage = "";
        
            if (leadmites > 0 || heavyLeadmites > 0) {
                const inventoryDetails = [];
                if (leadmites > 0) {
                    const verb = leadmites === 1 ? "is" : "are";
                    inventoryDetails.push(`${leadmites} leadmite${leadmites !== 1 ? "s" : ""} ${verb}`);
                }
                if (heavyLeadmites > 0) {
                    const verb = heavyLeadmites === 1 ? "is" : "are";
                    inventoryDetails.push(`${heavyLeadmites} heavyLeadmite${heavyLeadmites !== 1 ? "s" : ""} ${verb}`);
                }
        
                leadmiteMessage = `(${inventoryDetails.join(" and ")} in your inventory.`;
        
                const eatenDetails = [];
                if (eatenLeads > 0) {
                    eatenDetails.push(`${eatenLeads} lead${eatenLeads !== 1 ? "s" : ""}`);
                }
                if (eatenHeavyLeads > 0) {
                    eatenDetails.push(`${eatenHeavyLeads} heavy lead${eatenHeavyLeads !== 1 ? "s" : ""}`);
                }
        
                if (eatenDetails.length > 0) {
                    const verb = eatenDetails.length === 1 ? "has been" : "have been";
                    leadmiteMessage += ` ${eatenDetails.join(" and ")} ${verb} eaten.)`;
                } else {
                    leadmiteMessage += " No leads or heavy leads were eaten this round.)";
                }
            }
        
            return leadmiteMessage;
        }
    
}
    


