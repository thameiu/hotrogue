import { User } from "../models/User";

export class UserDAO {
    constructor(private db: any) {}

    async createUser(user: User): Promise<void> {
        await this.db.run(
        'INSERT INTO Users (email, username, password) VALUES (?, ?, ?)',
        [user.email, user.username, user.password]
        );
    }

    async getUserById(id: number): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE id = ?', [id]);
        return row ? new User(row.id, row.email, row.username, row.password) : null;
    }

    async getUserByMail(id: number): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE mail = ?', [id]);
        return row ? new User(row.id, row.email, row.username, row.password) : null;
    }
}
