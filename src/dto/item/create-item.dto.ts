export class CreateItemDto {
    constructor(
        public itemId: string,
        public name: string,
        public description: string,
        public rarity: number,
        public maxQuantity: number,
    ) {}

    static fromRequest(body: any): CreateItemDto | Error {
        if (!body.itemId || !body.name || !body.description || body.rarity === undefined || body.maxQuantity === undefined) {
            return Error("Invalid data: itemId, name, description, rarity and maxQuantity are required");
        }
        if (isNaN(body.rarity)) {
            return Error("Invalid data: rarity must be a number");
        }
        if (isNaN(body.maxQuantity)) {
            return Error("Invalid data: maxQuantity must be a number");
        }

        return new CreateItemDto(body.itemId, body.name, body.description, parseFloat(body.rarity), parseInt(body.maxQuantity));
    }
}
