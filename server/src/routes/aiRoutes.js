const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Gather live business context to inject into AI prompts
async function getBusinessContext() {
  const [invSummary, orderStats, financeSummary, millStats, recentOrders, topCustomers] = await Promise.all([
    prisma.paddyStock.aggregate({ _sum: { quantityKg: true }, _count: true }),
    prisma.order.groupBy({ by: ['status'], _count: true, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ _sum: { paidAmount: true, totalAmount: true } }),
    prisma.millBatch.groupBy({ by: ['status'], _count: true }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      include: { customer: { include: { user: { select: { name: true } } } }, items: true }
    }),
    prisma.order.groupBy({
      by: ['customerId'], _sum: { totalAmount: true }, orderBy: { _sum: { totalAmount: 'desc' } }, take: 5
    }),
  ]);

  const riceStock = await prisma.riceStock.aggregate({ _sum: { quantityKg: true } });
  const expenses = await prisma.expense.aggregate({ _sum: { amount: true } });
  const pendingOrders = orderStats.find(o => o.status === 'pending')?._count || 0;
  const totalRevenue = financeSummary._sum.paidAmount || 0;
  const totalOutstanding = (financeSummary._sum.totalAmount || 0) - totalRevenue;

  return `
LIVE BUSINESS DATA (as of ${new Date().toLocaleDateString('en-PK')}):
- Paddy Stock: ${(invSummary._sum.quantityKg || 0).toLocaleString()} kg across ${invSummary._count} entries
- Rice Stock: ${(riceStock._sum.quantityKg || 0).toLocaleString()} kg ready for sale
- Total Revenue Collected: PKR ${totalRevenue.toLocaleString()}
- Outstanding Receivables: PKR ${totalOutstanding.toLocaleString()}
- Total Expenses: PKR ${(expenses._sum.amount || 0).toLocaleString()}
- Net Profit: PKR ${(totalRevenue - (expenses._sum.amount || 0)).toLocaleString()}
- Pending Orders: ${pendingOrders}
- Mill Batches: ${millStats.map(m => `${m.status}: ${m._count}`).join(', ')}
- Recent Orders: ${recentOrders.map(o => `${o.orderNumber} (${o.customer?.user?.name}, PKR ${o.totalAmount?.toLocaleString()}, ${o.status})`).join(' | ')}
`;
}

// Chat endpoint
router.post('/chat', auth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'Messages required' });

    const businessContext = await getBusinessContext();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an expert business assistant for a Pakistani rice mill called "Pakistan Rice Mill".
You have real-time access to the business data below. Answer questions concisely and helpfully.
Give actionable advice based on the actual numbers. Respond in the same language the user writes in (English or Urdu).
Format numbers with PKR prefix and commas. Keep responses under 200 words unless detail is needed.

${businessContext}`,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    });

    res.json({ content: response.content[0].type === 'text' ? response.content[0].text : '' });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
});

// Auto-generated business insights
router.get('/insights', auth, async (req, res) => {
  try {
    const businessContext = await getBusinessContext();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: 'You are a concise business analyst for a Pakistani rice mill. Return exactly 4 actionable insights as a JSON array with fields: type (info|warning|success|tip), title (max 8 words), message (max 20 words), priority (1-3). Return ONLY valid JSON array, no other text.',
      messages: [{ role: 'user', content: `Analyze this data and give 4 insights:\n${businessContext}` }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    let insights;
    try {
      insights = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      insights = match ? JSON.parse(match[0]) : [];
    }
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

module.exports = router;
