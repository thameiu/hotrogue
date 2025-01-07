export class UpdateItemDto {
    constructor(
        public name: string,
        public description: string,
        public rarity: number,
        public maxQuantity: number,
    ) {}

    static fromRequest(body: any): UpdateItemDto | Error {
        if (!body.name && !body.description && body.rarity===undefined && body.maxQuantity===undefined) {
            return Error("Invalid data: name, description, rarity or maxQuantity is required");
        }
        if (isNaN(body.rarity)) {
            return Error("Invalid data: rarity must be a number");
        }
        if (isNaN(body.maxQuantity)) {
            return Error("Invalid data: maxQuantity must be a number");
        }

        return new UpdateItemDto( body.name, body.description, parseFloat(body.rarity), parseInt(body.maxQuantity));
    }
}
