import { GameItem } from "../models/GameItem";

export class GameItemDAO {
    constructor(private db: any) {}

    async createGameItem(gameItem: GameItem): Promise<void> {
        await this.db.run(
        'INSERT INTO GameItem (item, game, quantity) VALUES (?, ?, ?)',
        [gameItem.item, gameItem.game, gameItem.quantity]
        );
    }

    async updateGameItem(gameItem: GameItem): Promise<void> {
        await this.db.run(
            'UPDATE GameItem SET quantity = ? WHERE game = ? AND item = ?',
            [gameItem.quantity, gameItem.game, gameItem.item]
        );
    }

    async getGameItemByGameAndItem(gameId: number, itemId: string): Promise<GameItem | null> {
        const row = await this.db.get(
            "SELECT * FROM GameItem WHERE game = ? AND item = ?",
            [gameId, itemId]
        );
        return row ? new GameItem(row.item, row.game, row.quantity) : null;
    }
    
    async getAllGameItemsByGame(gameId: number): Promise<GameItem[]> {
        const rows = await this.db.all(
            "SELECT * FROM GameItem WHERE game = ?",
            [gameId]
        );
        return rows.map((row: any) => new GameItem(row.item, row.game, row.quantity));
    }
    
}