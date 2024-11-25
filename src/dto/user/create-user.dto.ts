export class CreateUserDto {
    constructor(
        public email: string,
        public username: string,
        public password: string,
        public admin: boolean = false,
    ) {}

    static fromRequest(body: any): CreateUserDto {
        if (!body.email || !body.username || !body.password) {
            throw new Error("Invalid data: email, username, and password are required.");
        }
        return new CreateUserDto(body.email, body.username, body.password, body.admin?body.admin:false);
    }
}
