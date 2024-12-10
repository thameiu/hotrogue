import { Stock } from "../models/Stock";

export class StockDAO {
    constructor(private db: any) {}

    async createStock(stock: Stock): Promise<void> {
        await this.db.run(
        'INSERT INTO Stock (item, user, quantity) VALUES (?, ?, ?)',
        [stock.item, stock.user, stock.quantity]
        );
    }

    async getStockByUserAndItem(userId: number, itemId: string): Promise<Stock | null> {
        const row = await this.db.get(
            "SELECT * FROM Stock WHERE user = ? AND item = ?",
            [userId, itemId]
        );
        return row ? new Stock(row.item, row.user, row.quantity) : null;
    }

    async updateStock(stock: Stock): Promise<void> {
        if (stock.quantity <= 0) {
            return this.deleteStock(stock);
        }
        await this.db.run(
            "UPDATE Stock SET quantity = ? WHERE user = ? AND item = ?",
            [stock.quantity, stock.user, stock.item]
        );
    }

    async deleteStock(stock: Stock): Promise<void> {
        await this.db.run(
            "DELETE FROM Stock WHERE user = ? AND item = ?",
            [stock.user, stock.item]
        );
    }


    async getAllStocksByUser(userId: number): Promise<Stock[]> {
        const rows = await this.db.all(
            "SELECT * FROM Stock WHERE user = ?",
            [userId]
        );
        return rows.map((row: any) => new Stock(row.item, row.user, row.quantity));
    }
    
}