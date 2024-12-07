import { Stock } from "../models/Stock";

export class StockDAO {
    constructor(private db: any) {}

    async createStock(stock: Stock): Promise<void> {
        await this.db.run(
        'INSERT INTO Stock (item, user, quantity) VALUES (?, ?, ?)',
        [stock.item, stock.user, stock.quantity]
        );
    }

    async getStock(item: number, user: number): Promise<Stock | null> {
        const row = await this.db.get(
        'SELECT * FROM Stock WHERE item = ? AND user = ?',
        [item, user]
        );
        return row ? new Stock(row.item, row.user, row.quantity) : null;
    }

    async getStockByUserAndItem(userId: number, itemId: string): Promise<Stock | null> {
        const row = await this.db.get(
            "SELECT * FROM Stock WHERE user = ? AND item = ?",
            [userId, itemId]
        );
        return row ? new Stock(row.item, row.user, row.quantity) : null;
    }

    async updateStock(stock: Stock): Promise<void> {
        await this.db.run(
            "UPDATE Stock SET quantity = ? WHERE user = ? AND item = ?",
            [stock.quantity, stock.user, stock.item]
        );
    }
    
}