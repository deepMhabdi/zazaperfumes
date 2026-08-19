import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { sendOrderConfirmation } from '../utils/email.js';

// ─── Create order (called after Stripe webhook confirms payment) ───────────
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, guestInfo, couponCode } = req.body;

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      const variant = product.variants.id(item.variantId) || product.variants.find((v) => v.size === item.size);
      if (!variant) return res.status(400).json({ message: 'Variant not found' });
      if (variant.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (${variant.size})` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        size: variant.size,
        sku: variant.sku,
        price: variant.price,
        quantity: item.quantity,
      });
      subtotal += variant.price * item.quantity;
    }

    // Apply coupon
    let discount = 0;
    let couponApplied;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const { valid } = coupon.isValid();
        if (valid && subtotal >= coupon.minOrderAmount) {
          discount = coupon.calculateDiscount(subtotal);
          couponApplied = { code: coupon.code, discount };
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const shipping = subtotal - discount >= 999 ? 0 : 99; // Free shipping above ₹999
    const total = subtotal - discount + shipping;

    const order = await Order.create({
      user: req.user?._id,
      guestInfo,
      items: orderItems,
      shippingAddress,
      couponApplied,
      totals: { subtotal, discount, shipping, total },
    });

    // Decrement stock
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, 'variants.size': item.size },
        { $inc: { 'variants.$.stock': -item.quantity, salesCount: item.quantity } }
      );
    }

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

// ─── Customer: my orders ───────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name slug images');
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name slug images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Ensure user owns it or is admin
    if (req.user && order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: all orders ─────────────────────────────────────────────────────
export const adminGetOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('user', 'name email'),
      Order.countDocuments(query),
    ]);
    res.json({ orders, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(trackingNumber && { trackingNumber }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: analytics ─────────────────────────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(period));

    const [revenueData, topProducts, orderStats] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totals.total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: since } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            units: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$totals.total' },
            count: { $sum: 1 },
            paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    res.json({ revenueData, topProducts, orderStats: orderStats[0] || {} });
  } catch (err) {
    next(err);
  }
};
