const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── TOOL DEFINITIONS (Claude tool_use format) ───────────────────────────────

const DATA_TOOLS = [
  {
    name: 'get_inventory',
    description: 'Retrieve current inventory levels for paddy and/or rice stock.',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['paddy', 'rice', 'both'], description: 'Which inventory type to fetch' },
        low_stock_only: { type: 'boolean', description: 'If true, only return entries below 500kg' }
      },
      required: ['type']
    }
  },
  {
    name: 'get_orders',
    description: 'Retrieve orders with optional status and date filters.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'all'] },
        payment_status: { type: 'string', enum: ['unpaid', 'partial', 'paid', 'all'] },
        limit: { type: 'number', description: 'Max orders to return (default 20)' },
        days_back: { type: 'number', description: 'Only fetch orders from last N days' }
      },
      required: ['status']
    }
  },
  {
    name: 'get_customers',
    description: 'Retrieve customer list with order history and outstanding balances.',
    input_schema: {
      type: 'object',
      properties: {
        sort_by: { type: 'string', enum: ['outstanding', 'total_revenue', 'recent_activity'] },
        has_outstanding: { type: 'boolean', description: 'If true, only return customers with unpaid balances' }
      },
      required: ['sort_by']
    }
  },
  {
    name: 'get_suppliers',
    description: 'Retrieve supplier list with purchase history.',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_financial_summary',
    description: 'Retrieve financial summary including revenue, expenses, profit, and outstanding amounts.',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['all_time', 'this_month', 'last_month', 'last_3_months'] }
      },
      required: ['period']
    }
  },
  {
    name: 'get_mill_status',
    description: 'Retrieve milling batch status, yield statistics, and operational metrics.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'pending', 'in_progress', 'completed'] },
        limit: { type: 'number' }
      },
      required: ['status']
    }
  },
  {
    name: 'get_sales_trends',
    description: 'Retrieve monthly revenue and order count trends.',
    input_schema: {
      type: 'object',
      properties: {
        months: { type: 'number', description: 'Number of past months (1-12)' }
      },
      required: ['months']
    }
  }
];

const ACTION_TOOLS = [
  {
    name: 'create_alert',
    description: 'Create a high-priority alert that will appear in the notification center.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short alert title (max 10 words)' },
        message: { type: 'string', description: 'Detailed alert message (max 30 words)' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        category: { type: 'string', enum: ['info', 'warning', 'action', 'insight'] }
      },
      required: ['title', 'message', 'priority', 'category']
    }
  },
  {
    name: 'update_order_status',
    description: 'Update the status of a specific order (only use when autoActions is enabled).',
    input_schema: {
      type: 'object',
      properties: {
        order_id: { type: 'string' },
        new_status: { type: 'string', enum: ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
        reason: { type: 'string' }
      },
      required: ['order_id', 'new_status', 'reason']
    }
  },
  {
    name: 'flag_customer',
    description: 'Create a high-priority alert flagging a customer for admin follow-up.',
    input_schema: {
      type: 'object',
      properties: {
        customer_name: { type: 'string' },
        reason: { type: 'string' },
        outstanding_amount: { type: 'number' }
      },
      required: ['customer_name', 'reason']
    }
  }
];

// ─── TOOL IMPLEMENTATIONS ────────────────────────────────────────────────────

async function executeTool(name, input, agentId) {
  switch (name) {
    case 'get_inventory': {
      const LOW = 500;
      const result = {};
      if (input.type === 'paddy' || input.type === 'both') {
        const where = input.low_stock_only ? { quantityKg: { lte: LOW } } : {};
        result.paddy = await prisma.paddyStock.findMany({
          where,
          include: { supplier: { include: { user: { select: { name: true } } } } },
          orderBy: { quantityKg: 'asc' }
        });
        result.paddyTotal = result.paddy.reduce((s, p) => s + p.quantityKg, 0);
      }
      if (input.type === 'rice' || input.type === 'both') {
        const where = input.low_stock_only ? { quantityKg: { lte: LOW } } : {};
        result.rice = await prisma.riceStock.findMany({ where, orderBy: { quantityKg: 'asc' } });
        result.riceTotal = result.rice.reduce((s, r) => s + r.quantityKg, 0);
      }
      return result;
    }

    case 'get_orders': {
      const where = {};
      if (input.status !== 'all') where.status = input.status;
      if (input.payment_status && input.payment_status !== 'all') where.paymentStatus = input.payment_status;
      if (input.days_back) {
        const from = new Date();
        from.setDate(from.getDate() - input.days_back);
        where.createdAt = { gte: from };
      }
      const orders = await prisma.order.findMany({
        where,
        take: input.limit || 20,
        include: {
          customer: { include: { user: { select: { name: true } } } },
          items: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return {
        orders: orders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer?.user?.name,
          total: o.totalAmount,
          paid: o.paidAmount,
          outstanding: o.totalAmount - o.paidAmount,
          status: o.status,
          paymentStatus: o.paymentStatus,
          items: o.items.length,
          date: o.createdAt
        })),
        count: orders.length
      };
    }

    case 'get_customers': {
      const customers = await prisma.customer.findMany({
        include: {
          user: { select: { name: true, email: true } },
          orders: { select: { totalAmount: true, paidAmount: true, status: true, createdAt: true } }
        }
      });
      const enriched = customers.map(c => {
        const totalRev = c.orders.reduce((s, o) => s + o.totalAmount, 0);
        const totalPaid = c.orders.reduce((s, o) => s + o.paidAmount, 0);
        const lastOrder = c.orders.sort((a, b) => b.createdAt - a.createdAt)[0];
        return {
          id: c.id,
          name: c.businessName,
          owner: c.user?.name,
          totalRevenue: totalRev,
          totalPaid,
          outstanding: totalRev - totalPaid,
          orderCount: c.orders.length,
          creditLimit: c.creditLimit,
          lastOrderDate: lastOrder?.createdAt
        };
      });
      if (input.has_outstanding) enriched.filter(c => c.outstanding > 0);
      const sorted = enriched.sort((a, b) => {
        if (input.sort_by === 'outstanding') return b.outstanding - a.outstanding;
        if (input.sort_by === 'total_revenue') return b.totalRevenue - a.totalRevenue;
        return new Date(b.lastOrderDate || 0) - new Date(a.lastOrderDate || 0);
      });
      return sorted.slice(0, 20);
    }

    case 'get_suppliers': {
      const suppliers = await prisma.supplier.findMany({
        include: {
          user: { select: { name: true } },
          purchases: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
      });
      return suppliers.map(s => ({
        name: s.businessName,
        owner: s.user?.name,
        recentPurchases: s.purchases.map(p => ({
          variety: p.variety,
          qty: p.quantityKg,
          total: p.totalAmount,
          outstanding: p.totalAmount - p.paidAmount,
          date: p.receivedAt
        })),
        totalPurchased: s.purchases.reduce((sum, p) => sum + p.totalAmount, 0)
      }));
    }

    case 'get_financial_summary': {
      const now = new Date();
      let from, label;
      if (input.period === 'this_month') { from = new Date(now.getFullYear(), now.getMonth(), 1); label = 'This month'; }
      else if (input.period === 'last_month') { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); label = 'Last month'; }
      else if (input.period === 'last_3_months') { from = new Date(now.getFullYear(), now.getMonth() - 3, 1); label = 'Last 3 months'; }
      else { from = null; label = 'All time'; }
      const dateFilter = from ? { createdAt: { gte: from } } : {};
      const dateFilterDate = from ? { date: { gte: from } } : {};
      const [rev, exp, purchases, outstanding] = await Promise.all([
        prisma.order.aggregate({ where: dateFilter, _sum: { paidAmount: true, totalAmount: true } }),
        prisma.expense.aggregate({ where: dateFilterDate, _sum: { amount: true } }),
        prisma.purchase.aggregate({ where: from ? { receivedAt: { gte: from } } : {}, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { paymentStatus: { not: 'paid' } }, _sum: { totalAmount: true, paidAmount: true } })
      ]);
      const revenue = rev._sum.paidAmount || 0;
      const expenses = (exp._sum.amount || 0) + (purchases._sum.totalAmount || 0);
      return {
        period: label,
        revenue,
        expenses,
        profit: revenue - expenses,
        purchaseCosts: purchases._sum.totalAmount || 0,
        operatingExpenses: exp._sum.amount || 0,
        outstandingReceivables: (outstanding._sum.totalAmount || 0) - (outstanding._sum.paidAmount || 0),
        totalBilled: rev._sum.totalAmount || 0,
        collectionRate: rev._sum.totalAmount ? ((revenue / rev._sum.totalAmount) * 100).toFixed(1) + '%' : 'N/A'
      };
    }

    case 'get_mill_status': {
      const where = input.status !== 'all' ? { status: input.status } : {};
      const [batches, stats] = await Promise.all([
        prisma.millBatch.findMany({
          where,
          include: { paddyStock: true },
          orderBy: { createdAt: 'desc' },
          take: input.limit || 15
        }),
        prisma.millBatch.aggregate({
          where: { status: 'completed' },
          _avg: { yieldPercent: true },
          _sum: { inputQuantityKg: true, outputQuantityKg: true },
          _count: true
        })
      ]);
      return {
        batches: batches.map(b => ({
          batchNumber: b.batchNumber,
          variety: b.paddyStock?.variety,
          input: b.inputQuantityKg,
          output: b.outputQuantityKg,
          yield: b.yieldPercent,
          status: b.status,
          date: b.createdAt
        })),
        stats: {
          avgYield: stats._avg.yieldPercent?.toFixed(2),
          totalInput: stats._sum.inputQuantityKg,
          totalOutput: stats._sum.outputQuantityKg,
          completedBatches: stats._count
        }
      };
    }

    case 'get_sales_trends': {
      const months = Math.min(input.months || 6, 12);
      const now = new Date();
      const data = [];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const [rev, cnt] = await Promise.all([
          prisma.order.aggregate({ where: { createdAt: { gte: start, lte: end } }, _sum: { paidAmount: true } }),
          prisma.order.count({ where: { createdAt: { gte: start, lte: end } } })
        ]);
        data.push({
          month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: rev._sum.paidAmount || 0,
          orders: cnt
        });
      }
      return data;
    }

    case 'create_alert': {
      await prisma.agentAlert.create({
        data: {
          agentId,
          title: input.title,
          message: input.message,
          priority: input.priority,
          category: input.category
        }
      });
      return { success: true, message: 'Alert created in notification center' };
    }

    case 'update_order_status': {
      const updated = await prisma.order.update({
        where: { id: input.order_id },
        data: { status: input.new_status }
      });
      return { success: true, orderNumber: updated.orderNumber, newStatus: input.new_status };
    }

    case 'flag_customer': {
      await prisma.agentAlert.create({
        data: {
          agentId,
          title: `⚑ Customer Flag: ${input.customer_name}`,
          message: `${input.reason}${input.outstanding_amount ? ` — Outstanding: PKR ${input.outstanding_amount.toLocaleString()}` : ''}`,
          priority: 'high',
          category: 'action'
        }
      });
      return { success: true };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

module.exports = { DATA_TOOLS, ACTION_TOOLS, executeTool };
