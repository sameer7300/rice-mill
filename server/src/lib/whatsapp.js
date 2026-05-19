/**
 * WhatsApp notification system
 * - WHATSAPP_ENABLED=false → mock mode (logs only, no actual sends)
 * - WHATSAPP_ENABLED=true + ULTRAMSG_* vars → sends via UltraMsg API
 * - All send functions are fire-and-forget (never throw)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_MODE = process.env.WHATSAPP_ENABLED !== 'true';

// ─── Phone Helpers ────────────────────────────────────────────────────────────

function cleanPhone(phone) {
  if (!phone) return null;
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '92' + p.slice(1);
  if (p.startsWith('+')) p = p.slice(1);
  if (!p) return null;
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

// ─── Log Helper ───────────────────────────────────────────────────────────────

async function logWhatsApp({ orderId, customerId, type, phone, message, status = 'sent', error = null, externalId = null }) {
  try {
    await prisma.whatsAppLog.create({
      data: {
        orderId: orderId || null,
        customerId: customerId || null,
        type,
        phone: phone || '',
        message,
        status,
        error: error ? String(error) : null,
        externalId: externalId || null,
      },
    });
  } catch (e) {
    console.error('[WhatsApp] Log error:', e.message);
  }
}

// ─── UltraMsg Provider ───────────────────────────────────────────────────────

async function sendViaUltraMsg(to, message) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  if (!instanceId || !token) return { success: false, error: 'UltraMsg not configured' };

  const p = cleanPhone(to);
  if (!p) return { success: false, error: 'Invalid phone number' };

  try {
    const https = require('https');
    const body = JSON.stringify({ token, to: p, body: message });
    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

    const result = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve({ sent: false, message: data }); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    if (result.sent === true || result.sent === 'true') {
      return { success: true, externalId: result.id || null };
    }
    return { success: false, error: result.message || JSON.stringify(result) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Core Sender ─────────────────────────────────────────────────────────────

async function send({ phone, message, type, orderId, customerId }) {
  if (!phone) return;
  const p = cleanPhone(phone);
  if (!p) return;

  if (MOCK_MODE) {
    console.log(`[WhatsApp MOCK] To: +${p}\n${message}\n`);
    logWhatsApp({ orderId, customerId, type, phone: p, message, status: 'mock' }).catch(() => {});
    return;
  }

  const result = await sendViaUltraMsg(p, message);
  logWhatsApp({
    orderId, customerId, type, phone: p, message,
    status: result.success ? 'sent' : 'failed',
    error: result.error || null,
    externalId: result.externalId || null,
  }).catch(() => {});
}

// ─── Settings Check ───────────────────────────────────────────────────────────

async function shouldSend(flagName) {
  try {
    const s = await prisma.storeSettings.findFirst();
    if (!s) return true;
    return s[flagName] !== false;
  } catch { return true; }
}

// ─── Message Builders ─────────────────────────────────────────────────────────

function buildOrderConfirmation(order, customer, items) {
  const phone = customer.phone || customer.user?.phone;
  const name = customer.user?.name || customer.businessName || 'Valued Customer';
  const itemLines = (items || [])
    .map(i => `  • ${i.variety} Grade ${i.grade} — ${i.quantityKg}kg × ${formatPKR(i.pricePerKg)} = ${formatPKR(i.totalPrice)}`)
    .join('\n');
  const message = [
    `🌾 *Al-Noor Rice Mills — Order Confirmed*`,
    ``,
    `As-Salamu Alaykum ${name}!`,
    `Your order has been placed successfully.`,
    ``,
    `📦 *Order #${order.orderNumber}*`,
    `Date: ${new Date(order.createdAt).toLocaleDateString('en-PK')}`,
    ``,
    itemLines,
    ``,
    `*Total: ${formatPKR(order.totalAmount)}*`,
    `📍 Delivery: ${order.deliveryAddress || 'To be confirmed'}`,
    ``,
    `Track: https://alnoorice.pk/track`,
    `📞 +92-946-123456`,
  ].filter(Boolean).join('\n');
  return { phone, message, url: buildUrl(phone, message) };
}

function buildOrderStatusUpdate(order, customer, newStatus) {
  const phone = customer.phone || customer.user?.phone;
  const name = customer.user?.name || customer.businessName || 'Customer';
  const statusEmoji = { confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '🎉', cancelled: '❌' }[newStatus] || '📋';
  const statusMsg = {
    confirmed: 'Your order has been confirmed.',
    processing: 'Your order is being processed at our mill.',
    shipped: 'Your order has been dispatched and is on the way!',
    delivered: 'Your order has been delivered. We hope you enjoy it!',
    cancelled: 'Your order has been cancelled. Contact us if you have questions.',
  }[newStatus] || `Order status: ${newStatus}`;
  const message = [
    `${statusEmoji} *Al-Noor Rice Mills — Order Update*`,
    ``,
    `Dear ${name},`,
    `Order #: *${order.orderNumber}* → *${newStatus.toUpperCase()}*`,
    ``,
    statusMsg,
    `Track: https://alnoorice.pk/track`,
    `📞 +92-946-123456`,
  ].join('\n');
  return { phone, message, url: buildUrl(phone, message) };
}

function buildPaymentReceived(order, customer, amount) {
  const phone = customer.phone || customer.user?.phone;
  const name = customer.user?.name || customer.businessName || 'Customer';
  const outstanding = order.totalAmount - (order.paidAmount || 0);
  const message = [
    `💰 *Al-Noor Rice Mills — Payment Received*`,
    ``,
    `Dear ${name},`,
    `Order #${order.orderNumber} — Amount: *${formatPKR(amount)}*`,
    outstanding > 0 ? `Outstanding: ${formatPKR(outstanding)}` : `*Fully Paid — Thank you!*`,
    `📞 +92-946-123456`,
  ].filter(Boolean).join('\n');
  return { phone, message, url: buildUrl(phone, message) };
}

function buildLowStockAlert(item, currentQty, adminPhone) {
  const message = [
    `⚠️ *Al-Noor Rice Mills — Low Stock Alert*`,
    ``,
    `Item: ${item.variety} Grade ${item.qualityGrade || item.grade}`,
    `Current Stock: *${currentQty}kg* (threshold: 500kg)`,
    ``,
    `Please arrange restocking urgently.`,
    `Login: https://alnoorice.pk/login`,
  ].join('\n');
  return { phone: adminPhone, message, url: buildUrl(adminPhone, message) };
}

function buildReviewApproved(review, customer, product) {
  const phone = customer.phone || customer.user?.phone;
  const name = customer.user?.name || 'Customer';
  const message = [
    `⭐ *Al-Noor Rice Mills — Review Approved*`,
    ``,
    `Dear ${name},`,
    `Your review for *${product.name}* is now live!`,
    `Rating: ${'⭐'.repeat(review.rating)}`,
    ``,
    `Thank you for your feedback!`,
    `Shop: https://alnoorice.pk`,
  ].join('\n');
  return { phone, message, url: buildUrl(phone, message) };
}

function buildWholesaleInquiry(inquiry, adminPhone) {
  const message = [
    `📦 *Al-Noor Rice Mills — New Wholesale Inquiry*`,
    ``,
    `From: ${inquiry.name} (${inquiry.email})`,
    `Quantity: ${inquiry.quantityKg}kg`,
    `Product: ${inquiry.riceVariety || 'General'}`,
    ``,
    `Review: https://alnoorice.pk/dashboard/wholesale`,
  ].join('\n');
  return { phone: adminPhone, message, url: buildUrl(adminPhone, message) };
}

function buildNewApplication(applicantName, jobTitle, adminPhone) {
  const message = [
    `👤 *Al-Noor Rice Mills — New Job Application*`,
    ``,
    `Position: ${jobTitle}`,
    `Applicant: ${applicantName}`,
    ``,
    `Review: https://alnoorice.pk/dashboard/careers`,
  ].join('\n');
  return { phone: adminPhone, message, url: buildUrl(adminPhone, message) };
}

function buildInterviewScheduled(applicantName, jobTitle, interviewDate, phone) {
  const dateStr = interviewDate ? new Date(interviewDate).toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short' }) : 'TBD';
  const message = [
    `🗓️ *Al-Noor Rice Mills — Interview Scheduled*`,
    ``,
    `Dear ${applicantName},`,
    `Your interview for *${jobTitle}* is confirmed:`,
    `📅 ${dateStr} PKT`,
    ``,
    `Please reply to confirm your attendance.`,
    `📞 +92-946-123456`,
  ].join('\n');
  return { phone, message, url: buildUrl(phone, message) };
}

// ─── Convenience Send Functions ───────────────────────────────────────────────

async function sendOrderConfirmationWA(order, customer, items) {
  if (!await shouldSend('notifyOrderConfirm')) return;
  const { phone, message } = buildOrderConfirmation(order, customer, items);
  send({ phone, message, type: 'order_confirm', orderId: order.id, customerId: customer.id }).catch(() => {});
}

async function sendOrderStatusWA(order, customer, newStatus) {
  if (!await shouldSend('notifyStatusUpdate')) return;
  const { phone, message } = buildOrderStatusUpdate(order, customer, newStatus);
  send({ phone, message, type: 'status_update', orderId: order.id, customerId: customer.id }).catch(() => {});
}

async function sendPaymentWA(order, customer, amount) {
  if (!await shouldSend('notifyPayment')) return;
  const { phone, message } = buildPaymentReceived(order, customer, amount);
  send({ phone, message, type: 'payment', orderId: order.id, customerId: customer.id }).catch(() => {});
}

async function sendLowStockWA(item, currentQty, adminPhone) {
  if (!await shouldSend('notifyLowStock')) return;
  const { phone, message } = buildLowStockAlert(item, currentQty, adminPhone);
  send({ phone, message, type: 'low_stock' }).catch(() => {});
}

async function sendReviewApprovedWA(review, customer, product) {
  const { phone, message } = buildReviewApproved(review, customer, product);
  send({ phone, message, type: 'review_approved' }).catch(() => {});
}

async function sendWholesaleInquiryWA(inquiry, adminPhone) {
  const { phone, message } = buildWholesaleInquiry(inquiry, adminPhone);
  send({ phone, message, type: 'wholesale_inquiry' }).catch(() => {});
}

async function sendNewApplicationWA(applicantName, jobTitle, adminPhone) {
  const { phone, message } = buildNewApplication(applicantName, jobTitle, adminPhone);
  send({ phone, message, type: 'new_application' }).catch(() => {});
}

async function sendInterviewScheduledWA(applicantName, jobTitle, interviewDate, applicantPhone) {
  const { phone, message } = buildInterviewScheduled(applicantName, jobTitle, interviewDate, applicantPhone);
  send({ phone, message, type: 'interview_scheduled' }).catch(() => {});
}

module.exports = {
  // Build only (for wa.me URL generation — used in route handlers)
  buildOrderConfirmation,
  buildOrderStatusUpdate,
  buildPaymentReceived,
  buildLowStockAlert,
  buildReviewApproved,
  buildWholesaleInquiry,
  buildNewApplication,
  buildInterviewScheduled,
  // Programmatic sends (fire-and-forget)
  sendOrderConfirmationWA,
  sendOrderStatusWA,
  sendPaymentWA,
  sendLowStockWA,
  sendReviewApprovedWA,
  sendWholesaleInquiryWA,
  sendNewApplicationWA,
  sendInterviewScheduledWA,
  // Core sender (exposed for custom one-off messages)
  send,
  // Utilities
  logWhatsApp,
  shouldSend,
  buildUrl,
  cleanPhone,
  // Legacy named exports kept for backward compat
  generateOrderConfirmation: buildOrderConfirmation,
  generateOrderStatusUpdate: buildOrderStatusUpdate,
  generatePaymentReceived: buildPaymentReceived,
  generateLowStockAlert: buildLowStockAlert,
  generateReviewApproved: buildReviewApproved,
  generateNewsletterWelcome: (email, phone) => buildLowStockAlert({ variety: 'Newsletter', grade: '' }, 0, phone),
};
