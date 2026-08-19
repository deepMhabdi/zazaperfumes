import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import {
  validateCoupon,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/admin', verifyToken, requireAdmin, adminGetCoupons);
router.post('/admin', verifyToken, requireAdmin, adminCreateCoupon);
router.put('/admin/:id', verifyToken, requireAdmin, adminUpdateCoupon);
router.delete('/admin/:id', verifyToken, requireAdmin, adminDeleteCoupon);

export default router;
