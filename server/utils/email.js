import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'ZAZA Perfumes <noreply@zazaperfumes.com>',
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmation = async (order, email) => {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #222">${item.name} (${item.size})</td>
          <td style="padding:8px;border-bottom:1px solid #222;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #222;text-align:right">₹${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  await sendEmail({
    to: email,
    subject: `✨ ZAZA Order Confirmed — ${order.orderNumber}`,
    html: `
    <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#0a0a0a;color:#e0e0e0;padding:32px;border-radius:8px">
      <h1 style="color:#C0C0C0;letter-spacing:4px;text-align:center">ZAZA</h1>
      <p style="text-align:center;color:#888;margin-top:-16px;letter-spacing:2px">PERFUMES</p>
      <h2 style="color:#fff;border-bottom:1px solid #333;padding-bottom:16px">Order Confirmed</h2>
      <p>Thank you for your order, <strong>${order.guestInfo?.name || 'Valued Customer'}</strong>.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <thead>
          <tr style="background:#1a1a1a">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right"><strong>Total: ₹${order.totals.total.toFixed(2)}</strong></p>
      <p style="color:#888;font-size:12px;margin-top:32px;text-align:center">ZAZA Perfumes · Luxury Fragrances</p>
    </div>`,
  });
};

export const sendPasswordReset = async (email, resetUrl) => {
  await sendEmail({
    to: email,
    subject: 'Reset your ZAZA Perfumes password',
    html: `
    <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#0a0a0a;color:#e0e0e0;padding:32px;border-radius:8px">
      <h1 style="color:#C0C0C0;letter-spacing:4px;text-align:center">ZAZA</h1>
      <h2 style="color:#fff">Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 32px;background:#C0C0C0;color:#0a0a0a;text-decoration:none;font-weight:bold;border-radius:4px;letter-spacing:2px">RESET PASSWORD</a>
      <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
    </div>`,
  });
};
