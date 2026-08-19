import express from 'express';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  adminGetOrders,
  adminUpdateOrderStatus,
  getAnalytics,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/admin/analytics', verifyToken, requireAdmin, getAnalytics);
router.get('/admin/all', verifyToken, requireAdmin, adminGetOrders);
router.get('/:id', optionalAuth, getOrderById);
router.patch('/:id/status', verifyToken, requireAdmin, adminUpdateOrderStatus);

export default router;
