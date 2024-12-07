import express from 'express';
import { UserController } from '../controllers/UserController';

const router = express.Router();


router.post('/', UserController.createUser as any);

export default router;
