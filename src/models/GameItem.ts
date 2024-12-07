export class GameId {
    constructor(
        public item: string,
        public game: number,
        public quantity: number,
    ) {}

    getItem() {
        return this.item;
    }

    getGame() {
    return this.game;
    }

    getQuantity() {
    return this.quantity;
    }
}
