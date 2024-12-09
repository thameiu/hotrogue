import express from 'express';
import { ItemController } from '../controllers/ItemController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware as any); //TODO : add admin middleware
router.post('/create', ItemController.createItem as any);
router.get('/inventory', ItemController.getUserInventory as any);




export default router;
