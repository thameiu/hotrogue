export class Item {
    constructor(
        public itemId: string,
        public name: string,
        public description: string,
        public rarity: number,
        public maxQuantity: number
    ) {}

    getItemId() {
        return this.itemId;
    }

    getName() {
    return this.name;
    }

    getDescription() {
    return this.description;
    }

    getRarity() {
    return this.rarity;
    }

    getMaxQuantity() {
    return this.maxQuantity;
    }
}
