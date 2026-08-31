import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { scheduleCampaign } from '../controllers/campaignController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const optionalUpload = (req, res, next) => {
  upload.single('file')(req, res, () => {
    next();
  });
};

router.post('/schedule', authMiddleware, optionalUpload, scheduleCampaign);

export default router;
