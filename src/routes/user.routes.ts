import { Router } from 'express';
import { getMyList, updateProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-list', authMiddleware, getMyList);
router.put('/profile', authMiddleware, updateProfile);

export default router;
