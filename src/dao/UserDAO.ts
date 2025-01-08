import { User } from "../models/User";

export class UserDAO {
    constructor(private db: any) {}

    async createUser(user: User): Promise<void> {
        await this.db.run(
        'INSERT INTO Users (email, username, password, role) VALUES (?, ?, ?, ?)',
        [user.email, user.username, user.password, user.role]
        );
    }

    async getUserById(id: number): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE id = ?', [id]);
        return row ? new User(row.id, row.email, row.username, row.password,row.role) : null;
    }

    async getUserByMail(email: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE email = ?', [email]);
        return row ? new User(row.id, row.email, row.username, row.password,row.role) : null;
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM Users WHERE username = ?', [username]);
        return row ? new User(row.id, row.email, row.username, row.password,row.role) : null;
    }

    async updateUser(user: User): Promise<void> {
        await this.db.run(
            'UPDATE Users SET email = ?, username = ?, password = ?, role = ? WHERE id = ?',
            [user.email, user.username, user.password, user.role, user.id]
        );
    }

    async deleteUser(id: number): Promise<void> {
        await this.db.run('DELETE FROM Users WHERE id = ?', [id]);
    }
    
}
