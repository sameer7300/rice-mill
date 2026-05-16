/**
 * WhatsApp notification helper using wa.me URL format.
 * Structure allows drop-in replacement with Twilio/360dialog later
 * by swapping out the `send` implementation.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function cleanPhone(phone) {
  // Convert Pakistani formats to international: 0300 → 92300, +92300 → 92300
  if (!phone) return null;
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '92' + p.slice(1);
  if (p.startsWith('+')) p = p.slice(1);
  return p;
}

function buildUrl(phone, message) {
  const p = cleanPhone(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

function formatPKR(n) {
  return `PKR ${(n || 0).toLocaleString()}`;
}

// ─── MESSAGE GENERATORS ───────────────────────────────────────────────────────

function generateOrderConfirmation(order, customer, items) {
  const phone = customer.phone || customer.user?.phone;
  const itemLines = (items || [])
    .map(i => `  • ${i.variety} Grade ${i.grade} — ${i.quantityKg}kg × ${formatPKR(i.pricePerKg)} = ${formatPKR(i.totalPrice)}`)
    .join('\n');

  const message = [
    `🌾 *Al-Noor Rice Mills — Order Confirmed*`,
    ``,
    `As-Salamu Alaykum ${customer.user?.name || customer.businessName}!`,
    `Your order has been placed successfully.`,
    ``,
    `📦 *Order Details*`,
    `Order #: ${order.orderNumber}`,
    `Date: ${new Date(order.createdAt).toLocaleDateString('en-PK')}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `Subtotal: ${formatPKR(order.totalAmount - (order.discountAmount || 0))}`,
    order.discountAmount > 0 ? `Discount: -${formatPKR(order.discountAmount)}` : null,
    `*Total: ${formatPKR(order.totalAmount)}*`,
    ``,
    `📍 Delivery: ${order.deliveryAddress || 'To be confirmed'}`,
    ``,
    `Track your order: https://alnoorice.pk/track?order=${order.orderNumber}`,
    ``,
    `Thank you for choosing Al-Noor Rice Mills!`,
    `📞 +92-946-123456`
  ].filter(Boolean).join('\n');

  return { phone, message, url: buildUrl(phone, message) };
}

function generateOrderStatusUpdate(order, customer, newStatus) {
  const phone = customer.phone || customer.user?.phone;
  const statusEmoji = {
    confirmed: '✅', processing: '⚙️', shipped: '🚚',
    delivered: '🎉', cancelled: '❌'
  }[newStatus] || '📋';

  const statusMsg = {
    confirmed: 'Your order has been confirmed and will be processed shortly.',
    processing: 'Your order is being processed at our mill.',
    shipped: 'Your order has been dispatched and is on the way!',
    delivered: 'Your order has been delivered. We hope you enjoy your rice!',
    cancelled: 'Your order has been cancelled. Please contact us if you have questions.'
  }[newStatus] || `Your order status has been updated to: ${newStatus}`;

  const message = [
    `${statusEmoji} *Al-Noor Rice Mills — Order Update*`,
    ``,
    `Dear ${customer.user?.name || customer.businessName},`,
    ``,
    `Order #: *${order.orderNumber}*`,
    `New Status: *${newStatus.toUpperCase()}*`,
    ``,
    statusMsg,
    ``,
    `Track: https://alnoorice.pk/track?order=${order.orderNumber}`,
    `Questions? Call: +92-946-123456`
  ].join('\n');

  return { phone, message, url: buildUrl(phone, message) };
}

function generatePaymentReceived(order, customer, amount) {
  const phone = customer.phone || customer.user?.phone;
  const outstanding = order.totalAmount - (order.paidAmount || 0);

  const message = [
    `💰 *Al-Noor Rice Mills — Payment Received*`,
    ``,
    `Dear ${customer.user?.name || customer.businessName},`,
    ``,
    `Payment confirmed for Order #${order.orderNumber}`,
    `Amount Received: *${formatPKR(amount)}*`,
    `Total Paid: ${formatPKR(order.paidAmount || amount)}`,
    outstanding > 0 ? `Outstanding: ${formatPKR(outstanding)}` : `*Fully Paid — Thank you!*`,
    ``,
    `📞 +92-946-123456`
  ].filter(Boolean).join('\n');

  return { phone, message, url: buildUrl(phone, message) };
}

function generateLowStockAlert(item, currentQty, adminPhone) {
  const message = [
    `⚠️ *Al-Noor Rice Mills — Low Stock Alert*`,
    ``,
    `Attention: Stock running low!`,
    ``,
    `Item: ${item.variety} Grade ${item.qualityGrade || item.grade}`,
    `Current Stock: *${currentQty}kg*`,
    `Threshold: 500kg`,
    ``,
    `Please arrange restocking urgently.`,
    `Login: https://alnoorice.pk/login`
  ].join('\n');

  return { phone: adminPhone, message, url: buildUrl(adminPhone, message) };
}

function generateReviewApproved(review, customer, product) {
  const phone = customer.phone || customer.user?.phone;
  const message = [
    `⭐ *Al-Noor Rice Mills — Review Approved*`,
    ``,
    `Dear ${customer.user?.name || 'Customer'},`,
    ``,
    `Your review for *${product.name}* has been approved and is now live!`,
    `Rating: ${'⭐'.repeat(review.rating)}`,
    ``,
    `Thank you for sharing your feedback.`,
    `Shop: https://alnoorice.pk`
  ].join('\n');

  return { phone, message, url: buildUrl(phone, message) };
}

function generateNewsletterWelcome(subscriberEmail, storePhone) {
  const message = [
    `📧 *Al-Noor Rice Mills — Welcome!*`,
    ``,
    `Thank you for subscribing to our newsletter.`,
    `You'll receive weekly rice price updates and offers.`,
    ``,
    `Email: ${subscriberEmail}`,
    `Unsubscribe: https://alnoorice.pk/policy`,
    ``,
    `📞 +92-946-123456`
  ].join('\n');
  return { phone: storePhone, message, url: buildUrl(storePhone, message) };
}

// ─── LOG HELPER ──────────────────────────────────────────────────────────────

async function logWhatsApp({ orderId, customerId, type, phone, message, status = 'sent' }) {
  try {
    await prisma.whatsAppLog.create({
      data: { orderId: orderId || null, customerId: customerId || null, type, phone: phone || '', message, status }
    });
  } catch (e) {
    console.error('WhatsApp log error:', e.message);
  }
}

// ─── SETTINGS CHECK ──────────────────────────────────────────────────────────

async function shouldSend(flagName) {
  try {
    const s = await prisma.storeSettings.findFirst();
    if (!s) return true;
    return s[flagName] !== false;
  } catch { return true; }
}

module.exports = {
  generateOrderConfirmation,
  generateOrderStatusUpdate,
  generatePaymentReceived,
  generateLowStockAlert,
  generateReviewApproved,
  generateNewsletterWelcome,
  logWhatsApp,
  shouldSend,
  buildUrl,
  cleanPhone
};
