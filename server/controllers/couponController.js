import Coupon from '../models/Coupon.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const { valid, message } = coupon.isValid();
    if (!valid) return res.status(400).json({ message });

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    const discount = coupon.calculateDiscount(subtotal);
    res.json({ coupon: { code: coupon.code, type: coupon.type, value: coupon.value }, discount });
  } catch (err) {
    next(err);
  }
};

export const adminGetCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
};

export const adminCreateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ coupon });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};
