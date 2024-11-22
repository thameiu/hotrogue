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
}