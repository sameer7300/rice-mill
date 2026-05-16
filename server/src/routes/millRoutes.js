const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function generateBatchNumber() {
  const now = new Date();
  return `BATCH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

router.get('/', auth, async (req, res) => {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (q) where.OR = [
      { batchNumber: { contains: q } },
      { paddyStock: { variety: { contains: q } } }
    ];
    const [batches, total] = await Promise.all([
      prisma.millBatch.findMany({
        where,
        include: { paddyStock: true, staff: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit)
      }),
      prisma.millBatch.count({ where })
    ]);
    res.json({ batches, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create batch — deducts paddy stock quantity
router.post('/', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { paddyStockId, inputQuantityKg, notes } = req.body;
    const qty = parseFloat(inputQuantityKg);

    const paddy = await prisma.paddyStock.findUnique({ where: { id: paddyStockId } });
    if (!paddy) return res.status(404).json({ message: 'Paddy stock not found' });
    if (paddy.quantityKg < qty) {
      return res.status(400).json({ message: `Insufficient paddy: available ${paddy.quantityKg}kg, requested ${qty}kg` });
    }

    const [batch] = await prisma.$transaction([
      prisma.millBatch.create({
        data: {
          batchNumber: generateBatchNumber(),
          paddyStockId,
          inputQuantityKg: qty,
          staffId: req.user.id,
          notes,
          status: 'pending'
        },
        include: { paddyStock: true }
      }),
      prisma.paddyStock.update({
        where: { id: paddyStockId },
        data: { quantityKg: { decrement: qty } }
      })
    ]);

    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/:id/start', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const batch = await prisma.millBatch.update({
      where: { id: req.params.id },
      data: { status: 'in_progress', startedAt: new Date() }
    });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete batch — adds rice stock with correct variety from paddy
router.patch('/:id/complete', auth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { outputQuantityKg, outputGrade, pricePerKg } = req.body;
    const output = parseFloat(outputQuantityKg);

    const batch = await prisma.millBatch.findUnique({
      where: { id: req.params.id },
      include: { paddyStock: true }
    });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    if (batch.status !== 'in_progress') return res.status(400).json({ message: 'Batch must be in progress to complete' });

    const yieldPercent = parseFloat(((output / batch.inputQuantityKg) * 100).toFixed(2));

    const [updatedBatch] = await prisma.$transaction([
      prisma.millBatch.update({
        where: { id: req.params.id },
        data: {
          outputQuantityKg: output,
          outputGrade: outputGrade || 'A',
          yieldPercent,
          status: 'completed',
          completedAt: new Date()
        }
      }),
      prisma.riceStock.create({
        data: {
          variety: batch.paddyStock?.variety || 'Standard',
          grade: outputGrade || 'A',
          quantityKg: output,
          pricePerKg: parseFloat(pricePerKg || 0)
        }
      })
    ]);

    res.json(updatedBatch);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.millBatch.count(),
      prisma.millBatch.count({ where: { status: 'pending' } }),
      prisma.millBatch.count({ where: { status: 'in_progress' } }),
      prisma.millBatch.count({ where: { status: 'completed' } })
    ]);
    const yieldData = await prisma.millBatch.aggregate({
      where: { status: 'completed' },
      _avg: { yieldPercent: true },
      _sum: { inputQuantityKg: true, outputQuantityKg: true }
    });
    res.json({
      total, pending, inProgress, completed,
      avgYield: yieldData._avg.yieldPercent,
      totalInput: yieldData._sum.inputQuantityKg || 0,
      totalOutput: yieldData._sum.outputQuantityKg || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
