export class StartGameDto {
    constructor(
        public category: string,
    ) {}

    static fromRequest(body: any): StartGameDto {
        if (!body.category || (body.category!=='classic' && body.category!=='itemless')) {
            throw new Error("Invalid data: choose a valid category");
        }
        return new StartGameDto(body.category);
    }
}
