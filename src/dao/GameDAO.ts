import { Game } from "../models/Game";

export class GameDAO {
    constructor(private db: any) {}

    async createGame(game: Game): Promise<void> {
        await this.db.run(
        'INSERT INTO Games (user, score, category, status) VALUES (?, ?, ?, ?)',
        [game.user, game.score, game.category, game.status]
        );
    }

    async getGameById(gameId: number): Promise<Game | null> {
        const row = await this.db.get('SELECT * FROM Games WHERE gameId = ?', [gameId]);
        return row ? new Game(row.gameId, row.user, row.score, row.category, row.status) : null;
    }
}

