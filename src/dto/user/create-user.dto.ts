export class CreateUserDto {
    constructor(
        public email: string,
        public username: string,
        public password: string,
        public role: string = 'player',
    ) {}

    static fromRequest(body: any): CreateUserDto | Error {
        if (!body.email || !body.username || !body.password) {
            return Error("Invalid data: email, username, and password are required.");
        }
        return new CreateUserDto(body.email, body.username, body.password, body.admin?body.admin:false);
    }
}
