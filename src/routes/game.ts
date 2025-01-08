import express from 'express';
import { GameController } from '../controllers/game/GameController.controller';
import { rbacMiddleware } from '../middleware/rbacMiddleware';

const router = express.Router();


/**
 * @swagger
 * /game:
 *   post:
 *     summary: Start a new game
 *     tags:
 *       - Game
 *     security:
 *       - jwtAuth: [] # Use the jwtAuth scheme defined in the components
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: The category for the game (e.g., trivia, puzzles).
 *                 example: "trivia"
 *             required:
 *               - category
 *     responses:
 *       201:
 *         description: Game started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Game started succesfully ! Toss a coin !"
 *                 user:
 *                   type: string
 *                   example: "john_doe"
 *       400:
 *         description: Bad request or an ongoing game already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "You already have an ongoing game"
 *       401:
 *         description: Unauthorized (invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Internal server error
 */
router.post('', rbacMiddleware(['player','admin','superAdmin']) as any,GameController.startGame as any);


/**
 * @swagger
 * /game/toss-coin:
 *   post:
 *     summary: Perform a coin toss in an ongoing game
 *     tags:
 *       - Game
 *     security:
 *       - jwtAuth: [] # Use the jwtAuth scheme defined in the components
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guess:
 *                 type: string
 *                 description: The player's guess for the coin toss result. Must be "heads" or "tails".
 *                 example: "heads"
 *               items:
 *                 type: object
 *                 description: Optional items used in the coin toss.
 *                 properties:
 *                   genieCoin:
 *                     type: boolean
 *                     description: Use a genie coin for the toss.
 *                     example: false
 *                   cheaterCoin:
 *                     type: boolean
 *                     description: Use a cheater coin for the toss.
 *                     example: false
 *                   miteCoin:
 *                     type: boolean
 *                     description: Use a mite coin for the toss.
 *                     example: false
 *                   lead:
 *                     type: object
 *                     properties:
 *                       quantity:
 *                         type: number
 *                         description: Quantity of lead used in the toss.
 *                         example: 2
 *                       side:
 *                         type: string
 *                         description: The side of the lead coin to influence the result ("heads" or "tails").
 *                         example: "heads"
 *                   heavyLead:
 *                     type: object
 *                     properties:
 *                       quantity:
 *                         type: number
 *                         description: Quantity of heavy lead used in the toss.
 *                         example: 1
 *                       side:
 *                         type: string
 *                         description: The side of the heavy lead coin to influence the result ("heads" or "tails").
 *                         example: "tails"
 *                   spring:
 *                     type: boolean
 *                     description: Use a spring to save the game in case of an incorrect guess.
 *                     example: true
 *     responses:
 *       200:
 *         description: The result of the coin toss
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coinResult:
 *                   type: string
 *                   description: The result of the coin toss.
 *                   example: "heads"
 *                 message:
 *                   type: string
 *                   description: Outcome message for the player.
 *                   example: "You guessed correctly! Toss again!"
 *       400:
 *         description: Bad request (e.g., invalid input or rules violation)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "You can only use up to 5 leads in total (including heavyLeads)."
 *       401:
 *         description: Unauthorized (invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       404:
 *         description: No ongoing game found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No ongoing game found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/toss-coin', rbacMiddleware(['player','admin','superAdmin']) as any,GameController.tossCoin as any);

/**
 * @swagger
 * /game/leaderboard:
 *   get:
 *     summary: Retrieve the game leaderboard
 *     tags:
 *       - Game
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   description: A list of players and their scores
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         description: The player's username
 *                         example: "john_doe"
 *                       score:
 *                         type: number
 *                         description: The player's score
 *                         example: 150
 *                       category:
 *                         type: string
 *                         description: The category of the game
 *                         example: "classic"
 *                       place:
 *                         type: number
 *                         description: The player's position in the leaderboard
 *                         example: 1
 *       401:
 *         description: Unauthorized (invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/leaderboard', GameController.getLeaderboard as any);

export default router;
