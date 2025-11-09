import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  voteProduct,
  addComment
} from '../controllers/product.controller';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getAllProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/', authMiddleware, createProduct);
router.post('/:id/vote', authMiddleware, voteProduct);
router.post('/:id/comments', authMiddleware, addComment);

export default router;
