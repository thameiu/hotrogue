export class CreateItemDto {
    constructor(
        public itemId: string,
        public name: string,
        public description: string,
        public rarity: number,
        public maxQuantity: number,
    ) {}

    static fromRequest(body: any): CreateItemDto {
        if (!body.itemId || !body.name || !body.description || !body.rarity || !body.maxQuantity) {
            throw new Error("Invalid data: iteùId, name, description, rarity and maxQuantity are required");
        }
        return new CreateItemDto(body.itemId, body.name, body.description, body.rarity, body.maxQuantity);
    }
}