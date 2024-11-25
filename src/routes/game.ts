import express from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.post('/start', GameController.startGame);
router.post('/toss-coin', GameController.tossCoin);



export default router;
