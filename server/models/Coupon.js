import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percent', 'flat'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number, // cap for percent coupons
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // empty = all products
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function () {
  const now = new Date();
  if (!this.active) return { valid: false, message: 'Coupon is inactive' };
  if (this.expiryDate < now) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (subtotal) {
  if (this.type === 'flat') return Math.min(this.value, subtotal);
  const discount = (subtotal * this.value) / 100;
  return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
