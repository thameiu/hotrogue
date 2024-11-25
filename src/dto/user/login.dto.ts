export class LoginDto {
    constructor(
        public email: string,
        public password: string
    ) {}

    static fromRequest(body: any): LoginDto {
        if (!body.email || !body.password) {
            throw new Error("Invalid data: email and password are required.");
        }
        return new LoginDto(body.email, body.password);
    }
}
