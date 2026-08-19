import Stripe from 'stripe';
import Order from '../models/Order.js';
import { sendOrderConfirmation } from '../utils/email.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items, shippingAddress, guestInfo, couponCode } = req.body;

    // Build Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: `${item.name} (${item.size})`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      customer_email: req.user?.email || guestInfo?.email,
      metadata: {
        userId: req.user?._id?.toString() || 'guest',
        guestName: guestInfo?.name || '',
        guestEmail: guestInfo?.email || '',
        shippingAddress: JSON.stringify(shippingAddress),
        couponCode: couponCode || '',
        items: JSON.stringify(items),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const metadata = session.metadata;
      const items = JSON.parse(metadata.items || '[]');
      const shippingAddress = JSON.parse(metadata.shippingAddress || '{}');

      const order = await Order.create({
        user: metadata.userId !== 'guest' ? metadata.userId : undefined,
        guestInfo: metadata.userId === 'guest'
          ? { name: metadata.guestName, email: metadata.guestEmail }
          : undefined,
        items: items.map((i) => ({
          product: i.productId,
          name: i.name,
          image: i.image,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress,
        status: 'confirmed',
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        totals: {
          subtotal: session.amount_total / 100,
          discount: 0,
          shipping: 0,
          total: session.amount_total / 100,
        },
      });

      // Send confirmation email
      const email = session.customer_email || metadata.guestEmail;
      if (email) {
        try {
          await sendOrderConfirmation(order, email);
        } catch (emailErr) {
          console.error('Order confirmation email failed:', emailErr.message);
        }
      }
    } catch (orderErr) {
      console.error('Order creation from webhook failed:', orderErr);
    }
  }

  res.json({ received: true });
};

export const getSessionOrder = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
