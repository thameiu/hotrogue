import express from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware as any);
router.post('/start', GameController.startGame as any);
router.post('/toss-coin', GameController.tossCoin as any);



export default router;
