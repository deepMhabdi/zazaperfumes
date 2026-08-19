import { body } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
} from '../utils/jwt.js';
import { sendPasswordReset } from '../utils/email.js';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Validation Rules ─────────────────────────────────────────────────────
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[A-Z])(?=.*[0-9])/)
    .withMessage('Password must contain at least one uppercase letter and one number'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// ─── Helpers ──────────────────────────────────────────────────────────────
const issueTokens = async (user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken]; // keep last 5
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

// ─── Controllers ──────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, passwordHash: password });
    const { accessToken, refreshToken } = await issueTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const googleOAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+refreshTokens');
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = 'google';
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const { accessToken, refreshToken: newRefresh } = await issueTokens(user);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If this email exists, a reset link was sent' });

    const resetToken = signPasswordResetToken({ id: user._id, type: 'reset' });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordReset(email, resetUrl);
    } catch {
      console.error('Email send failed');
    }

    res.json({ message: 'If this email exists, a reset link was sent' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'reset') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.passwordHash = password;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: { _id: req.params.addressId } },
    });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);
    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};
