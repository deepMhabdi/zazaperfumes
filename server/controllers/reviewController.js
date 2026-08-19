import Review from '../models/Review.js';
import Order from '../models/Order.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const [reviews, total] = await Promise.all([
      Review.find({ product: productId, isApproved: true })
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('user', 'name'),
      Review.countDocuments({ product: productId, isApproved: true }),
    ]);
    res.json({ reviews, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, text } = req.body;

    // Check for duplicate
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(409).json({ message: 'You have already reviewed this product' });

    // Check verified purchase
    const hasOrdered = await Order.findOne({
      user: req.user._id,
      paymentStatus: 'paid',
      'items.product': productId,
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      text,
      verifiedPurchase: !!hasOrdered,
    });

    await review.populate('user', 'name');
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    res.json({ review });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
