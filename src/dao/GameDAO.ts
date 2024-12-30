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

    async getGamesByUserId(userId: number): Promise<Game[]> {
        const rows = await this.db.all('SELECT * FROM Games WHERE user = ?', [userId]);
        return rows.map((row: any) => new Game(row.gameId, row.user, row.score, row.category, row.status));
    }

    async getOngoingGame(userId: number): Promise<Game | null> {
        const row = await this.db.get('SELECT * FROM Games WHERE user = ? AND status = "ongoing" LIMIT 1', [userId]);
        return row ? new Game(row.gameId, row.user, row.score, row.category, row.status) : null;
    }
    
    async updateGame(game: Game): Promise<void> {
        const query = "UPDATE games SET score = ?, status = ? WHERE gameId = ?";
        await this.db.run(query, [game.score, game.status, game.gameId]);
    }

    async getLeaderboard(): Promise<{ place: number; username: string; score: number; category: string }[]> {
        const rows = await this.db.all(`
            SELECT 
                g.score, 
                g.category, 
                u.username
            FROM Games g
            INNER JOIN (
                SELECT user, MAX(score) AS maxScore
                FROM Games
                GROUP BY user
            ) grouped
            ON g.user = grouped.user AND g.score = grouped.maxScore
            INNER JOIN Users u
            ON g.user = u.id
            ORDER BY g.score DESC
        `);

        return rows.map((row: any, index: number) => ({
            place: index + 1,
            username: row.username,
            score: row.score,
            category: row.category,
        }));
    }
    
}

