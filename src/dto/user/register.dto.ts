export class RegisterDto {
    constructor(
        public email: string,
        public username: string,
        public password: string,
        public passwordConfirm: string
    ) {}

    static fromRequest(body: any): RegisterDto | Error {
        // Check if required fields are missing
        if (!body.email || !body.password || !body.username || !body.passwordConfirm) {
            return Error("Invalid data: email, username, password, and password confirmation are required.");
        }

        // Check if password and passwordConfirm match
        if (body.password !== body.passwordConfirm) {
            return Error("Invalid data: password and password confirmation must be the same.");
        }

        // If everything is valid, return the DTO
        return new RegisterDto(body.email, body.username, body.password, body.passwordConfirm);
    }
}
