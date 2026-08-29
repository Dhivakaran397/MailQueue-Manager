import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { scheduleCampaign } from '../controllers/campaignController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/schedule', authMiddleware, upload.single('file'), scheduleCampaign);

export default router;
