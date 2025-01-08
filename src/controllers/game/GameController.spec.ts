import { Request, Response } from "express";
import { GameController } from "../game/GameController.controller";
import { AuthController } from "../auth/AuthController.controller";
import { GameDAO } from "../../dao/GameDAO";
import { Game } from "../../models/Game";
import { initDB } from "../../db/db";

jest.mock("../../db/db");
jest.mock("../auth/AuthController.controller");
jest.mock("../../dao/GameDAO");

describe("GameController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("startGame", () => {
        it("should return 400 and an error message if no category is chosen", async () => {
            jest.spyOn(AuthController, "getUserByToken").mockResolvedValue(null);

            await GameController.startGame(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid data: choose a valid category" });
        });
        it("should return 201 and create a new game if no ongoing game exists", async () => {
            const mockUser = { id: 1, username: "testuser", email: "test@example.com", password: "password123", role: 'player', getId: jest.fn(), getUsername: jest.fn(), getEmail: jest.fn(), getPassword: jest.fn(), getRole: jest.fn() };
            const mockStartGameDto = { category: "classic" };

            req.body = mockStartGameDto;
            jest.spyOn(AuthController, "getUserByToken").mockResolvedValue(mockUser);

            const ongoingGameSpy = jest.spyOn(GameDAO.prototype, "getOngoingGame").mockResolvedValue(null);
            const createGameSpy = jest.spyOn(GameDAO.prototype, 'createGame').mockResolvedValueOnce();

            const mockGameDAO = new GameDAO(initDB());



            jest.spyOn(AuthController, "getUserByToken").mockResolvedValue(mockUser);



            await GameController.startGame(req as Request, res as Response);

            expect(ongoingGameSpy).toHaveBeenCalledWith(mockUser.id);

            expect(createGameSpy).toHaveBeenCalledWith(
                    {
                    gameId:expect.any(Number),    
                    user: mockUser.id,
                    category: "classic",
                    status: "ongoing",
                    score:0,
                    }
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Game started succesfully ! Toss a coin !",
                user: mockUser.username,
            });
        });

        it("should return 400 and an error message if category isn't valid", async () => {
            jest.spyOn(AuthController, "getUserByToken");

            await GameController.startGame(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid data: choose a valid category" });
        });
    });
});
