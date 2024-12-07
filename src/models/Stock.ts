export class Stock {
    constructor(
        public item: string,
        public user: number,
        public quantity: number,
    ) {}

    getItem() {
        return this.item;
    }

    getUser() {
    return this.user;
    }

    getQuantity() {
    return this.quantity;
    }
}
