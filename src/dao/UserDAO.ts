import { User } from "../models/User";

export class UserDAO {
    constructor(private db: any) {}

    async createUser(user: User): Promise<void> {
        await this.db.run(
        'INSERT INTO Users (email, username, password, admin) VALUES (?, ?, ?, ?)',
        [user.email, user.username, user.password, user.admin]
        );
    }

    async getUserById(id: number): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE id = ?', [id]);
        return row ? new User(row.id, row.email, row.username, row.password,row.admin) : null;
    }

    async getUserByMail(email: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE email = ?', [email]);
        return row ? new User(row.id, row.email, row.username, row.password,row.admin) : null;
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE username = ?', [username]);
        return row ? new User(row.id, row.email, row.username, row.password,row.admin) : null;
    }
}
