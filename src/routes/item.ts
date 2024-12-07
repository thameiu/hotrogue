import express from 'express';
import { ItemController } from '../controllers/ItemController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware); //TODO : add admin middleware
router.post('/create', ItemController.createItem);



export default router;
