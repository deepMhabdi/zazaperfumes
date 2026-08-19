import express from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import {
  register,
  registerRules,
  login,
  loginRules,
  googleOAuth,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
} from '../controllers/authController.js';

const router = express.Router();

// Public
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/google', authLimiter, googleOAuth);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);
router.post('/addresses', verifyToken, addAddress);
router.delete('/addresses/:addressId', verifyToken, deleteAddress);
router.post('/wishlist', verifyToken, toggleWishlist);
router.get('/wishlist', verifyToken, getWishlist);

export default router;
