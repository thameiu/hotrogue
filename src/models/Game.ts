export class Game {
    constructor(
        public gameId: number,
        public user: number,
        public score: string,
        public category: string
    ) {}

    getGameId() {
        return this.gameId;
    }
    
    getUser() {
        return this.user;
    }
    
    getScore() {
        return this.score;
    }
    
    getCategory() {
        return this.category;
    }
}
