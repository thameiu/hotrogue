import { Item } from "../models/Item";

export class ItemDAO {
    constructor(private db: any) {}

    async createItem(item: Item): Promise<void> {
        await this.db.run(
        'INSERT INTO Items (itemId, name, description, rarity, maxQuantity) VALUES (?, ?, ?, ?, ?)',
        [item.itemId, item.name, item.description, item.rarity, item.maxQuantity]
        );
    }

    async getItemById(itemId: string): Promise<Item | null> {
        const row = await this.db.get('SELECT * FROM Items WHERE itemId = ?', [itemId]);
        return row
        ? new Item(row.itemId, row.name, row.description, row.rarity, row.maxQuantity)
        : null;
    }
}
