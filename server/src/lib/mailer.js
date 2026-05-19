const nodemailer = require('nodemailer');

const BRAND = {
  name: 'Al-Noor Rice Mills',
  email: 'ricemill@sameergul.com',
  phone: '+92-946-123456',
  mobile: '+92-300-1234567',
  address: 'Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan',
  green: '#16a34a',
  dark: '#14532d',
  url: 'https://alnoorice.pk',
};

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '465') === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// All email templates use inline CSS — email clients strip <style> tags
function base(content, previewText) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${BRAND.name}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
${previewText ? `<div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr><td style="background-color:${BRAND.dark};padding:28px 32px;text-align:center;">
  <p style="margin:0 0 6px 0;font-size:28px;line-height:1;">🌾</p>
  <h1 style="margin:0;font-size:21px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${BRAND.name}</h1>
  <p style="margin:4px 0 0 0;font-size:11px;color:rgba(255,255,255,0.65);">Batkhela, Malakand, KPK · Pakistan</p>
</td></tr>

<!-- BODY -->
<tr><td style="padding:32px;">
  ${content}
</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="margin:0 0 3px 0;font-size:12px;font-weight:600;color:#374151;">${BRAND.name}</p>
  <p style="margin:0 0 3px 0;font-size:11px;color:#9ca3af;">${BRAND.address}</p>
  <p style="margin:0 0 8px 0;font-size:11px;color:#9ca3af;">📞 ${BRAND.phone} &nbsp;·&nbsp; 📱 ${BRAND.mobile} &nbsp;·&nbsp; ✉️ ${BRAND.email}</p>
  <p style="margin:0;font-size:10px;color:#d1d5db;">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(label, url, color) {
  const c = color || BRAND.green;
  return `<a href="${url}" style="display:inline-block;background-color:${c};color:#ffffff;padding:13px 30px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;line-height:1.4;">${label}</a>`;
}

function infoBox(html, bgColor, borderColor) {
  const bg = bgColor || '#f0fdf4';
  const bd = borderColor || '#bbf7d0';
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid ${bd};border-radius:10px;margin:16px 0;"><tr><td style="padding:16px;font-size:14px;color:#374151;line-height:1.6;">${html}</td></tr></table>`;
}

function warningBox(html) {
  return infoBox(html, '#fef3c7', '#fde68a');
}

function dangerBox(html) {
  return infoBox(html, '#fef2f2', '#fecaca');
}

function hr() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr><td style="border-top:1px solid #e5e7eb;"></td></tr></table>`;
}

function formatPKR(n) { return `PKR ${(Number(n) || 0).toLocaleString()}`; }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' }); }

async function sendMail(to, subject, html) {
  const t = getTransporter();
  if (!t) return null;
  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || `"${BRAND.name}" <${BRAND.email}>`,
      replyTo: process.env.SMTP_REPLY_TO || BRAND.email,
      to, subject, html,
    });
    return info;
  } catch (err) {
    console.error('[Mailer]', err.message);
    return null;
  }
}

// ─── 1. Welcome ───────────────────────────────────────────────────────────────

async function sendWelcomeEmail(to, name, referralCode) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Welcome, ${name}! 🌾</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.6;">Your <strong>${BRAND.name}</strong> account is ready. Order premium Pakistani rice directly from our mill in Batkhela — no middlemen, best quality, best price.</p>
${infoBox(`<strong style="color:${BRAND.green};">With your account you can:</strong>
<ul style="margin:8px 0 0 0;padding-left:22px;font-size:14px;color:#374151;line-height:1.8;">
  <li>🛒 Order Basmati, Super Kernel & more varieties</li>
  <li>📦 Track orders in real-time</li>
  <li>⭐ Earn loyalty points on every order</li>
  <li>❤️ Save favourites &amp; get back-in-stock alerts</li>
  <li>👥 Refer friends — earn 100 pts per referral</li>
</ul>`)}
${referralCode ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin:16px 0;">
<tr><td style="padding:16px;text-align:center;">
  <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;">Your Referral Code</p>
  <p style="margin:0 0 4px 0;font-size:28px;font-weight:700;color:#92400e;letter-spacing:0.12em;font-family:Courier,monospace;">${referralCode}</p>
  <p style="margin:0;font-size:12px;color:#6b7280;">Share to earn 100 loyalty points per friend who orders</p>
</td></tr>
</table>` : ''}
<div style="text-align:center;margin:24px 0 8px 0;">${btn('Start Shopping →', BRAND.url)}</div>
<p style="margin:12px 0 0 0;font-size:12px;color:#9ca3af;text-align:center;">Mon–Sat, 8:00 AM – 6:00 PM PKT · ${BRAND.phone}</p>`;

  await sendMail(to, `Welcome to ${BRAND.name}! 🌾`, base(content, `Welcome ${name}! Your account is ready — shop premium rice from Batkhela.`));
}

// ─── 2. Order Confirmation ─────────────────────────────────────────────────────

async function sendOrderConfirmation(to, order, items) {
  const rows = (items || []).map(i => `
<tr>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${i.variety}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;text-align:center;">Grade ${i.grade}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;text-align:center;">${i.quantityKg}kg</td>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;text-align:right;">${formatPKR(i.pricePerKg)}/kg</td>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:${BRAND.green};text-align:right;">${formatPKR(i.totalPrice)}</td>
</tr>`).join('');

  const content = `
<div style="text-align:center;margin-bottom:24px;">
  <p style="margin:0 0 4px 0;font-size:48px;line-height:1;">✅</p>
  <h2 style="margin:0 0 6px 0;font-size:24px;font-weight:700;color:#111827;">Order Confirmed!</h2>
  <p style="margin:0;font-size:15px;color:#6b7280;">Thank you! We'll start preparing your order right away.</p>
</div>
${infoBox(`<strong style="font-size:18px;color:${BRAND.green};">Order #${order.orderNumber}</strong><br>
<span style="font-size:13px;color:#6b7280;">Placed: ${fmtDate(order.createdAt)}</span><br><br>
<strong>Delivery to:</strong> ${order.deliveryAddress || 'To be confirmed'}<br>
<strong>Payment:</strong> ${order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash on Delivery'}`)}

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin:16px 0;">
<thead>
<tr style="background-color:#f9fafb;">
  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Variety</th>
  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Grade</th>
  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Qty</th>
  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Rate</th>
  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Total</th>
</tr>
</thead>
<tbody>${rows}</tbody>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
  ${order.discountAmount > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Discount</td><td style="padding:4px 0;font-size:14px;color:${BRAND.green};text-align:right;">−${formatPKR(order.discountAmount)}</td></tr>` : ''}
  <tr style="border-top:2px solid #e5e7eb;">
    <td style="padding:10px 0 0 0;font-size:17px;font-weight:700;color:#111827;">Order Total</td>
    <td style="padding:10px 0 0 0;font-size:17px;font-weight:700;color:${BRAND.green};text-align:right;">${formatPKR(order.totalAmount)}</td>
  </tr>
</table>

<div style="text-align:center;margin:0 0 16px 0;">${btn('Track Your Order', `${BRAND.url}/track?order=${order.orderNumber}`)}</div>
<p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">Questions? WhatsApp ${BRAND.mobile} or call ${BRAND.phone}</p>`;

  await sendMail(to, `Order Confirmed: ${order.orderNumber} — ${BRAND.name}`, base(content, `Your order ${order.orderNumber} is confirmed. We're preparing it now!`));
}

// ─── 3. Order Status Update ────────────────────────────────────────────────────

async function sendOrderStatusUpdate(to, order, newStatus) {
  const MAP = {
    confirmed:  { emoji: '✅', title: 'Order Confirmed',   msg: "We've confirmed your order and are preparing it for dispatch." },
    processing: { emoji: '⚙️', title: 'Being Prepared',    msg: "Your rice is being cleaned, sorted, and packed at our Batkhela mill." },
    shipped:    { emoji: '🚚', title: 'Order Shipped',      msg: `Your order is on its way!${order.courierName ? ` Courier: <strong>${order.courierName}</strong>.` : ''}${order.trackingNumber ? ` Tracking: <strong>${order.trackingNumber}</strong>.` : ''}` },
    delivered:  { emoji: '🎉', title: 'Order Delivered',    msg: "Your order has been delivered. We hope you love it!" },
    cancelled:  { emoji: '❌', title: 'Order Cancelled',    msg: "Your order has been cancelled. Contact us if you have questions." },
  };
  const m = MAP[newStatus] || { emoji: '📋', title: `Status: ${newStatus}`, msg: `Your order status has been updated to <strong>${newStatus}</strong>.` };

  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">${m.emoji} ${m.title}</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.6;">${m.msg}</p>
${infoBox(`<strong>Order #${order.orderNumber}</strong> &nbsp; <span style="display:inline-block;background-color:${BRAND.green};color:#fff;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize;">${newStatus}</span>`)}
${newStatus === 'delivered'
  ? `<p style="font-size:14px;color:#374151;margin:0 0 16px 0;">Leave a review and earn <strong>50 loyalty points</strong>!</p>
     <div style="text-align:center;margin-bottom:16px;">${btn('Leave a Review →', BRAND.url)}</div>`
  : `<div style="text-align:center;margin:0 0 16px 0;">${btn('Track Order', `${BRAND.url}/track?order=${order.orderNumber}`)}</div>`}
<p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">Questions? WhatsApp ${BRAND.mobile}</p>`;

  await sendMail(to, `Your Order ${order.orderNumber} is ${m.title} ${m.emoji}`, base(content, `Order ${order.orderNumber}: ${m.title}`));
}

// ─── 4. Payment Confirmation ───────────────────────────────────────────────────

async function sendPaymentConfirmation(to, order, amountPaid) {
  const remaining = Math.max(0, (order.totalAmount || 0) - (amountPaid || 0));
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Payment Received 💳</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">We've received your payment for order <strong>#${order.orderNumber}</strong>.</p>
${infoBox(`
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="font-size:14px;color:#6b7280;padding:4px 0;">Amount Received</td><td style="font-size:20px;font-weight:700;color:${BRAND.green};text-align:right;padding:4px 0;">${formatPKR(amountPaid)}</td></tr>
  <tr><td style="font-size:14px;color:#6b7280;padding:4px 0;">Order Total</td><td style="font-size:14px;color:#374151;text-align:right;padding:4px 0;">${formatPKR(order.totalAmount)}</td></tr>
  ${remaining > 0
    ? `<tr style="border-top:1px solid #d1fae5;"><td style="font-size:14px;color:#dc2626;font-weight:600;padding:8px 0 0 0;">Remaining Balance</td><td style="font-size:14px;color:#dc2626;font-weight:600;text-align:right;padding:8px 0 0 0;">${formatPKR(remaining)}</td></tr>`
    : `<tr style="border-top:1px solid #d1fae5;"><td colspan="2" style="font-size:13px;color:${BRAND.green};font-weight:700;text-align:center;padding:8px 0 0 0;">✅ Fully Paid — Thank You!</td></tr>`}
</table>`)}
<div style="text-align:center;margin:16px 0;">${btn('View Order', `${BRAND.url}/track?order=${order.orderNumber}`)}</div>`;

  await sendMail(to, `Payment Received — ${formatPKR(amountPaid)} | ${BRAND.name}`, base(content, `Payment of ${formatPKR(amountPaid)} received for order ${order.orderNumber}.`));
}

// ─── 5. Password Reset ─────────────────────────────────────────────────────────

async function sendPasswordResetEmail(to, name, resetToken) {
  const url = `${BRAND.url}/reset-password?token=${resetToken}`;
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Reset Your Password 🔑</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.6;">Hi ${name}, we received a request to reset your <strong>${BRAND.name}</strong> password. Click the button below to set a new one.</p>
<div style="text-align:center;margin:20px 0;">${btn('Reset My Password', url)}</div>
${warningBox(`⏱️ <strong>This link expires in 1 hour.</strong> If you didn't request a reset, ignore this email — your password is unchanged.`)}
<p style="margin:12px 0 0 0;font-size:12px;color:#9ca3af;word-break:break-all;">Or copy this link: <a href="${url}" style="color:${BRAND.green};">${url}</a></p>
<p style="margin:12px 0 0 0;font-size:13px;color:#6b7280;">Security concerns? Contact us: ${BRAND.phone} or <a href="mailto:${BRAND.email}" style="color:${BRAND.green};">${BRAND.email}</a></p>`;

  await sendMail(to, `Reset Your Password — ${BRAND.name}`, base(content, 'Reset your Al-Noor Rice Mills password — expires in 1 hour.'));
}

// ─── 6. Password Changed ───────────────────────────────────────────────────────

async function sendPasswordChangedEmail(to, name) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Password Changed 🔒</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Hi ${name}, your password was successfully changed on <strong>${fmtDate(new Date())}</strong>.</p>
${dangerBox(`🚨 <strong>Not you?</strong> Contact us immediately:<br>
📞 ${BRAND.phone} &nbsp;|&nbsp; 💬 WhatsApp: ${BRAND.mobile} &nbsp;|&nbsp; ✉️ <a href="mailto:${BRAND.email}" style="color:#dc2626;">${BRAND.email}</a>`)}
<div style="text-align:center;margin:16px 0;">${btn('Go to My Account', `${BRAND.url}/dashboard`)}</div>`;

  await sendMail(to, `Password Changed — ${BRAND.name}`, base(content, 'Your Al-Noor Rice Mills password was just changed.'));
}

// ─── 7. Review Approved ────────────────────────────────────────────────────────

async function sendReviewApprovedEmail(to, name, productName, rating) {
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, rating || 5)));
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Your Review is Live! ⭐</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Hi ${name || 'there'}, your ${stars} review for <strong>${productName}</strong> has been approved and is now visible to all customers.</p>
${infoBox(`🎁 <strong>+50 Loyalty Points Earned!</strong> Check your balance in <em>My Account → Rewards</em>.`)}
<p style="font-size:14px;color:#374151;margin:0 0 16px 0;">Thank you for helping other buyers make informed decisions. Your feedback is valuable to us!</p>
<div style="text-align:center;margin:16px 0;">${btn('Shop More', BRAND.url)}</div>`;

  await sendMail(to, `Your Review Has Been Published ⭐ | ${BRAND.name}`, base(content, `Your review for ${productName} is now live!`));
}

// ─── 8. Review Rejected ────────────────────────────────────────────────────────

async function sendReviewRejectedEmail(to, name, productName, adminNote) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Update on Your Review</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Hi ${name || 'there'}, thank you for reviewing <strong>${productName}</strong>. Unfortunately, we were unable to publish it at this time.</p>
${adminNote ? infoBox(`<strong>Reason:</strong> ${adminNote}`) : ''}
<p style="font-size:14px;color:#374151;margin:0 0 8px 0;">We welcome honest feedback! Your review should:</p>
<ul style="font-size:14px;color:#374151;padding-left:22px;margin:0 0 16px 0;line-height:1.8;">
  <li>Focus on your personal experience with the product</li>
  <li>Be specific about quality, taste, or delivery</li>
  <li>Avoid inappropriate language</li>
</ul>
<div style="text-align:center;margin:16px 0;">${btn('Write a New Review', BRAND.url)}</div>`;

  await sendMail(to, `Update on Your Review — ${BRAND.name}`, base(content, `Update regarding your review for ${productName}.`));
}

// ─── 9. Newsletter Welcome ─────────────────────────────────────────────────────

async function sendNewsletterWelcomeEmail(to) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">You're Subscribed! 🌾</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Thank you for subscribing to <strong>${BRAND.name}</strong> newsletter. Here's what to expect:</p>
${infoBox(`<ul style="margin:0;padding-left:22px;font-size:14px;color:#374151;line-height:1.9;">
  <li>📊 Weekly rice price updates from Batkhela mandi</li>
  <li>🌾 New harvest announcements — first to know</li>
  <li>🎁 Exclusive subscriber-only offers and discounts</li>
  <li>📦 Seasonal promotions and bulk order deals</li>
</ul>`)}
<div style="text-align:center;margin:20px 0;">${btn('Shop Now', BRAND.url)}</div>
<p style="margin:12px 0 0 0;font-size:11px;color:#9ca3af;text-align:center;">To unsubscribe anytime, visit <a href="${BRAND.url}/policies" style="color:${BRAND.green};">our policies page</a>.</p>`;

  await sendMail(to, `You're subscribed! 🌾 Rice updates from ${BRAND.name}`, base(content, 'Welcome to Al-Noor Rice Mills newsletter!'));
}

// ─── 10. Contact Confirmation ──────────────────────────────────────────────────

async function sendContactConfirmationEmail(to, name, subject) {
  const ref = `MSG-${Date.now().toString().slice(-6)}`;
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Message Received! 💬</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Hi ${name}, we got your message and will respond within <strong>24 hours</strong> (Mon–Sat, 8 AM – 6 PM PKT).</p>
${infoBox(`<strong>Reference:</strong> ${ref}<br><strong>Subject:</strong> ${subject}<br><strong>Expected reply:</strong> Within 24 business hours`)}
<p style="font-size:14px;color:#374151;margin:0 0 8px 0;">For urgent queries, reach us directly:</p>
<ul style="font-size:14px;color:#374151;padding-left:22px;margin:0 0 16px 0;line-height:1.9;">
  <li>📞 ${BRAND.phone}</li>
  <li>💬 WhatsApp: ${BRAND.mobile}</li>
  <li>✉️ <a href="mailto:${BRAND.email}" style="color:${BRAND.green};">${BRAND.email}</a></li>
</ul>
<div style="text-align:center;margin:16px 0;">${btn('Visit Our Store', BRAND.url)}</div>`;

  await sendMail(to, `We received your message — ${BRAND.name}`, base(content, `Message received. Ref: ${ref}. We'll respond within 24 hours.`));
}

// ─── 11. Low Stock Alert (internal — to admin) ────────────────────────────────

async function sendLowStockAlertEmail(items) {
  if (!items?.length) return;
  const rows = items.map(i => `
<tr>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${i.variety || i.name}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:center;color:#374151;">${i.grade || '—'}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:#dc2626;text-align:right;">${i.quantityKg}kg</td>
</tr>`).join('');

  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#dc2626;">⚠️ Low Stock Alert</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;"><strong>${items.length} item(s)</strong> are running critically low and need restocking.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin:16px 0;">
<thead><tr style="background-color:#fef2f2;">
  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Variety</th>
  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Grade</th>
  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Remaining</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
<div style="text-align:center;margin:16px 0;">${btn('Go to Inventory', `${BRAND.url}/dashboard/inventory`)}</div>`;

  await sendMail(BRAND.email, `⚠️ Low Stock Alert — ${items.length} item(s) need attention`, base(content, `${items.length} low stock items need restocking.`));
}

// ─── 12. Back in Stock ────────────────────────────────────────────────────────

async function sendStockAvailableEmail(to, productName, productUrl) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">${productName} is Back! 🌾</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Great news! <strong>${productName}</strong> — the product you were watching — is back in stock at <strong>${BRAND.name}</strong>.</p>
${warningBox(`⚡ <strong>Act fast!</strong> Stock is limited and could sell out quickly.`)}
<div style="text-align:center;margin:20px 0;">${btn('Shop Now →', productUrl || BRAND.url)}</div>
<p style="margin:12px 0 0 0;font-size:11px;color:#9ca3af;text-align:center;">You signed up for this stock alert. <a href="${BRAND.url}" style="color:${BRAND.green};">Manage alerts in My Account</a></p>`;

  await sendMail(to, `${productName} is back in stock! 🌾 | ${BRAND.name}`, base(content, `${productName} is back! Limited stock available now.`));
}

// ─── 13. Wholesale Inquiry (internal) ────────────────────────────────────────

async function sendWholesaleInquiryEmail(inquiry) {
  const rows = [
    ['Company', inquiry.companyName || inquiry.contactName],
    ['Contact', inquiry.contactName],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone || '—'],
    ['Variety', inquiry.riceVariety || '—'],
    ['Quantity', `${(inquiry.quantityKg || 0).toLocaleString()} kg`],
    ['Frequency', inquiry.frequency || '—'],
    ['Budget/kg', inquiry.budgetPerKg ? formatPKR(inquiry.budgetPerKg) : '—'],
  ].map(([l, v]) => `
<tr>
  <td style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:600;background-color:#f9fafb;width:38%;border-bottom:1px solid #f3f4f6;">${l}</td>
  <td style="padding:8px 12px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${v}</td>
</tr>`).join('');

  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">🏭 New Wholesale Inquiry</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">A new bulk inquiry has been submitted. Review and respond promptly to convert it.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin:16px 0;">
<tbody>${rows}</tbody>
</table>
${inquiry.message ? infoBox(`<strong>Customer Message:</strong><br><span style="font-style:italic;">${inquiry.message}</span>`) : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
<tr>
  ${inquiry.phone ? `<td style="text-align:center;padding:4px;">
    <a href="https://wa.me/${inquiry.phone.replace(/\D/g, '')}" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">💬 WhatsApp Reply</a>
  </td>` : ''}
  <td style="text-align:center;padding:4px;">
    <a href="mailto:${inquiry.email}" style="display:inline-block;background-color:${BRAND.green};color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">✉️ Email Reply</a>
  </td>
  <td style="text-align:center;padding:4px;">
    <a href="${BRAND.url}/dashboard/wholesale" style="display:inline-block;background-color:#374151;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">📋 View Dashboard</a>
  </td>
</tr>
</table>`;

  await sendMail(BRAND.email, `New Wholesale Inquiry — ${(inquiry.quantityKg || 0).toLocaleString()}kg from ${inquiry.contactName}`, base(content, 'New wholesale inquiry received — reply promptly.'));
}

// ─── 14. 2FA Enabled ──────────────────────────────────────────────────────────

async function send2FAEnabledEmail(to, name) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">2FA Enabled Successfully 🔐</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">Hi ${name}, Two-Factor Authentication was enabled on your account on <strong>${fmtDate(new Date())}</strong>.</p>
${infoBox(`<strong style="color:${BRAND.green};">Your account is now more secure.</strong>
<ul style="margin:8px 0 0 0;padding-left:22px;font-size:14px;color:#374151;line-height:1.8;">
  <li>You'll need your authenticator app on every sign-in</li>
  <li>Store your backup codes somewhere safe (offline)</li>
  <li>Each backup code can only be used once</li>
</ul>`)}
${dangerBox(`🚨 <strong>Not you?</strong> Secure your account immediately:<br>📞 ${BRAND.phone} &nbsp;|&nbsp; 💬 WhatsApp: ${BRAND.mobile}`)}
<div style="text-align:center;margin:16px 0;">${btn('Manage Security', `${BRAND.url}/dashboard`)}</div>`;

  await sendMail(to, `Two-Factor Authentication Enabled — ${BRAND.name}`, base(content, '2FA has been enabled on your Al-Noor Rice Mills account.'));
}

// ─── 15. Newsletter Blast (bulk) ──────────────────────────────────────────────

async function sendNewsletterBlast(recipients, subject, htmlContent) {
  const t = getTransporter();
  if (!t || !recipients?.length) return { sent: 0, failed: 0 };
  const footerHtml = `${hr()}<p style="font-size:11px;color:#9ca3af;text-align:center;margin:0;">You received this because you subscribed to ${BRAND.name} updates.<br><a href="${BRAND.url}/policies" style="color:${BRAND.green};">Unsubscribe</a></p>`;
  const html = base(`${htmlContent}${footerHtml}`, subject);
  let sent = 0, failed = 0;
  for (const email of recipients) {
    try {
      await t.sendMail({ from: process.env.SMTP_FROM || `"${BRAND.name}" <${BRAND.email}>`, replyTo: BRAND.email, to: email, subject, html });
      sent++;
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`[Blast] failed for ${email}:`, err.message);
      failed++;
    }
  }
  return { sent, failed };
}

// ─── Test Email ───────────────────────────────────────────────────────────────

async function sendTestEmail(to) {
  const content = `
<h2 style="margin:0 0 10px 0;font-size:22px;font-weight:700;color:#111827;">Test Email ✅</h2>
<p style="margin:0 0 16px 0;font-size:15px;color:#374151;">SMTP is configured correctly! Emails from <strong>${BRAND.name}</strong> are working.</p>
${infoBox(`<strong>SMTP Host:</strong> ${process.env.SMTP_HOST}<br>
<strong>Port:</strong> ${process.env.SMTP_PORT} (${process.env.SMTP_SECURE === 'true' ? 'SSL' : 'TLS'})<br>
<strong>From:</strong> ${process.env.SMTP_USER}<br>
<strong>Tested at:</strong> ${new Date().toISOString()}`)}`;

  return await sendMail(to, `Test Email — ${BRAND.name}`, base(content, 'SMTP test email from Al-Noor Rice Mills.'));
}

// ─── Exports ──────────────────────────────────────────────────────────────────

// ─── CAREER EMAILS ────────────────────────────────────────────────────────────

async function sendApplicationReceivedEmail(to, name, jobTitle) {
  const transporter = getTransporter();
  if (!transporter) return;
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">Application Received! 🎉</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Thank you for applying for the <strong>${jobTitle}</strong> position at Al-Noor Rice Mills.</p>
    ${infoBox(`<strong>What happens next?</strong><br><br>
      ✅ Your application has been received and is under review.<br>
      📋 Our team will carefully review your qualifications.<br>
      📞 If shortlisted, we will contact you within 7–10 business days.`)}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">We appreciate your interest in joining our team. Al-Noor Rice Mills is committed to building a talented, diverse workforce that shares our passion for quality.</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Application Received — ${jobTitle} | Al-Noor Rice Mills`,
    html: base(content, `We received your application for ${jobTitle}`),
  }).catch(() => {});
}

async function sendApplicationUnderReviewEmail(to, name, jobTitle) {
  const transporter = getTransporter();
  if (!transporter) return;
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">Your Application Is Under Review 🔍</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Great news! Your application for <strong>${jobTitle}</strong> has moved to the review stage.</p>
    ${infoBox(`Our hiring team is actively reviewing your profile and qualifications. We will be in touch soon with further updates.`)}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">Thank you for your patience. We take the time to carefully evaluate every candidate to find the best fit.</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Application Update — ${jobTitle} | Al-Noor Rice Mills`,
    html: base(content, `Your application for ${jobTitle} is being reviewed`),
  }).catch(() => {});
}

async function sendInterviewInvitationEmail(to, name, jobTitle, interviewDate, interviewMode, notes) {
  const transporter = getTransporter();
  if (!transporter) return;
  const modeLabel = { online: 'Online (Video Call)', onsite: 'On-site (Our Office)', phone: 'Phone Call' }[interviewMode] || interviewMode;
  const dateStr = interviewDate ? new Date(interviewDate).toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Karachi' }) : 'To be confirmed';
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">Interview Invitation 🗓️</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Congratulations! We are pleased to invite you for an interview for the <strong>${jobTitle}</strong> position.</p>
    ${infoBox(`<strong>Interview Details:</strong><br><br>
      📅 <strong>Date & Time:</strong> ${dateStr} PKT<br>
      📍 <strong>Format:</strong> ${modeLabel}<br>
      ${notes ? `📝 <strong>Notes:</strong> ${notes}` : ''}`)}
    <p style="margin:16px 0;font-size:15px;color:#374151;line-height:1.6;">Please confirm your availability by replying to this email. If you need to reschedule, contact us at least 24 hours in advance.</p>
    <p style="margin:0;font-size:14px;color:#6b7280;">📞 ${BRAND.phone} &nbsp;·&nbsp; ✉️ ${BRAND.email}</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Interview Invitation — ${jobTitle} | Al-Noor Rice Mills`,
    html: base(content, `You've been invited to interview for ${jobTitle}`),
  }).catch(() => {});
}

async function sendOfferLetterEmail(to, name, jobTitle, offerAmount, offerExpiry) {
  const transporter = getTransporter();
  if (!transporter) return;
  const expiryStr = offerExpiry ? new Date(offerExpiry).toLocaleDateString('en-PK', { dateStyle: 'long' }) : '7 days from receipt';
  const salaryStr = offerAmount ? `PKR ${offerAmount.toLocaleString('en-PK')} per month` : 'As discussed';
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">Offer Letter — Congratulations! 🎊</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">Dear <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">We are delighted to extend a job offer for the position of <strong>${jobTitle}</strong> at Al-Noor Rice Mills.</p>
    ${infoBox(`<strong>Offer Summary:</strong><br><br>
      💼 <strong>Position:</strong> ${jobTitle}<br>
      💰 <strong>Compensation:</strong> ${salaryStr}<br>
      ⏰ <strong>Offer Valid Until:</strong> ${expiryStr}`)}
    <p style="margin:16px 0;font-size:15px;color:#374151;line-height:1.6;">Please review the offer carefully. To accept, reply to this email or contact us directly. We look forward to welcoming you to our team!</p>
    <p style="margin:0;font-size:14px;color:#6b7280;">📞 ${BRAND.phone} &nbsp;·&nbsp; ✉️ ${BRAND.email}</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Job Offer — ${jobTitle} | Al-Noor Rice Mills`,
    html: base(content, `Congratulations! You have received a job offer`),
  }).catch(() => {});
}

async function sendApplicationAcceptedEmail(to, name, jobTitle, loginEmail, tempPassword) {
  const transporter = getTransporter();
  if (!transporter) return;
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">Welcome to Al-Noor Rice Mills! 🌾</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">Dear <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">We are thrilled to confirm your acceptance to join Al-Noor Rice Mills as <strong>${jobTitle}</strong>. Your staff account has been created:</p>
    ${infoBox(`<strong>Your Login Credentials:</strong><br><br>
      📧 <strong>Email:</strong> ${loginEmail}<br>
      🔑 <strong>Temporary Password:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace;">${tempPassword}</code><br><br>
      ⚠️ You will be required to change your password on first login.`)}
    <div style="text-align:center;margin:24px 0;">${btn('Login to Dashboard', `${BRAND.url}/login`)}</div>
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">If you have any questions about onboarding, please contact HR at ${BRAND.email} or call ${BRAND.phone}.</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Welcome to the Team — Account Created | Al-Noor Rice Mills`,
    html: base(content, `Your staff account at Al-Noor Rice Mills has been created`),
  }).catch(() => {});
}

async function sendApplicationRejectedEmail(to, name, jobTitle, reason) {
  const transporter = getTransporter();
  if (!transporter) return;
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">Application Update</h2>
    <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">Dear <strong>${name}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Thank you for your interest in the <strong>${jobTitle}</strong> position at Al-Noor Rice Mills and for the time you invested in your application.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
    ${reason ? dangerBox(`<strong>Feedback:</strong><br>${reason}`) : ''}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">We encourage you to apply for future positions that match your skills. We wish you the best in your career journey.</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Application Status — ${jobTitle} | Al-Noor Rice Mills`,
    html: base(content, `An update regarding your application for ${jobTitle}`),
  }).catch(() => {});
}

async function sendNewApplicationNotificationEmail(jobTitle, applicantName, applicantEmail, applicationId) {
  const transporter = getTransporter();
  if (!transporter) return;
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#14532d;">New Job Application Received</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">A new application has been submitted:</p>
    ${infoBox(`<strong>Position:</strong> ${jobTitle}<br>
      <strong>Applicant:</strong> ${applicantName}<br>
      <strong>Email:</strong> ${applicantEmail}`)}
    <div style="text-align:center;margin:24px 0;">${btn('Review Application', `${BRAND.url}/dashboard/careers`)}</div>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: BRAND.email,
    subject: `New Application: ${jobTitle} — ${applicantName}`,
    html: base(content, `New application received for ${jobTitle}`),
  }).catch(() => {});
}

async function sendRegistrationOTPEmail(to, name, otp) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#14532d;">Verify Your Account</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">As-Salamu Alaykum ${name}! Use the code below to complete your registration:</p>
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#f0fdf4;border:2px dashed #16a34a;border-radius:14px;padding:20px 40px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#16a34a;letter-spacing:1px;text-transform:uppercase;">Your OTP</p>
        <p style="margin:0;font-size:42px;font-weight:900;color:#14532d;letter-spacing:10px;font-family:monospace;">${otp}</p>
      </div>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    ${warningBox('If you did not request this, you can safely ignore this email.')}`;
  await sendMail(to, 'Your Registration OTP — Al-Noor Rice Mills', base(content, `Your OTP: ${otp}`));
}

module.exports = {
  // Primary (new)
  sendWelcomeEmail,
  sendRegistrationOTPEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPaymentConfirmation,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
  sendNewsletterWelcomeEmail,
  sendContactConfirmationEmail,
  sendLowStockAlertEmail,
  sendStockAvailableEmail,
  sendWholesaleInquiryEmail,
  send2FAEnabledEmail,
  sendNewsletterBlast,
  sendTestEmail,
  // Career emails
  sendApplicationReceivedEmail,
  sendApplicationUnderReviewEmail,
  sendInterviewInvitationEmail,
  sendOfferLetterEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendNewApplicationNotificationEmail,
  // Legacy aliases — keeps existing route code working without changes
  sendRegistrationWelcome: sendWelcomeEmail,
  sendNewsletterWelcome: sendNewsletterWelcomeEmail,
  sendPasswordChanged: sendPasswordChangedEmail,
  sendReviewApproved: (to, productName, rating) => sendReviewApprovedEmail(to, '', productName, rating),
  sendContactConfirmation: sendContactConfirmationEmail,
};
