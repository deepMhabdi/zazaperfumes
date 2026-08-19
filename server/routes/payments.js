import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  createCheckoutSession,
  stripeWebhook,
  getSessionOrder,
} from '../controllers/paymentController.js';

const router = express.Router();

// Stripe webhook — must receive raw body
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-session', optionalAuth, createCheckoutSession);
router.get('/session/:sessionId', getSessionOrder);

export default router;
