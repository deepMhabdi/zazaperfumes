import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import {
  getProductReviews,
  createReview,
  markHelpful,
  adminDeleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', verifyToken, createReview);
router.patch('/:id/helpful', markHelpful);
router.delete('/:id', verifyToken, requireAdmin, adminDeleteReview);

export default router;
