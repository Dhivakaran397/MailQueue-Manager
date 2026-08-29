import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getRecipients } from '../controllers/recipientController.js';

const router = express.Router();

router.get('/', authMiddleware, getRecipients);

export default router;
