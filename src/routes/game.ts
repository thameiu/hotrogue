import express from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.post('/start', GameController.startGame);


export default router;
