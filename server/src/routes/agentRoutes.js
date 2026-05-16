const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const { runAgent, stopAgent, isRunning } = require('../agents/engine');
const { AGENT_PRESETS } = require('../agents/presets');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/agents/presets — return agent type metadata
router.get('/presets', auth, requireRole('admin'), (req, res) => {
  const presets = Object.entries(AGENT_PRESETS).map(([type, p]) => ({
    type, label: p.label, icon: p.icon, description: p.description, defaultTask: p.defaultTask
  }));
  res.json(presets);
});

// GET /api/agents — list all agents
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: { select: { runs: true, alerts: true } },
        runs: { orderBy: { startedAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });
    const enriched = agents.map(a => ({
      ...a,
      isRunning: isRunning(a.id),
      lastRun: a.runs[0] || null,
      totalRuns: a._count.runs,
      unreadAlerts: a._count.alerts
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/agents — create agent
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, type, description, instructions, schedule, autoActions } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type required' });
    const preset = AGENT_PRESETS[type];
    if (!preset && type !== 'custom') return res.status(400).json({ message: 'Invalid agent type' });

    const agent = await prisma.agent.create({
      data: {
        name,
        type,
        description: description || preset?.description || '',
        instructions: instructions || null,
        schedule: schedule || 'manual',
        autoActions: Boolean(autoActions),
        lastStatus: 'idle',
        createdById: req.user.id
      }
    });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/agents/:id — update agent
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, instructions, schedule, isActive, autoActions } = req.body;
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: { name, description, instructions, schedule, isActive, autoActions: Boolean(autoActions) }
    });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/agents/:id — delete agent
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    if (isRunning(req.params.id)) await stopAgent(req.params.id);
    await prisma.agent.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/agents/:id/run — trigger agent execution
router.post('/:id/run', auth, requireRole('admin'), async (req, res) => {
  try {
    const { task } = req.body;
    if (isRunning(req.params.id)) return res.status(409).json({ message: 'Agent is already running' });

    const run = await runAgent(req.params.id, task || null, req.user.id);
    res.status(202).json({ runId: run.id, message: 'Agent started' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/agents/:id/stop — stop a running agent
router.post('/:id/stop', auth, requireRole('admin'), async (req, res) => {
  try {
    const stopped = await stopAgent(req.params.id);
    res.json({ stopped });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/agents/:id/runs — run history
router.get('/:id/runs', auth, requireRole('admin'), async (req, res) => {
  try {
    const runs = await prisma.agentRun.findMany({
      where: { agentId: req.params.id },
      orderBy: { startedAt: 'desc' },
      take: 20
    });
    res.json(runs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/agents/runs/:runId — get specific run result
router.get('/runs/:runId', auth, requireRole('admin'), async (req, res) => {
  try {
    const run = await prisma.agentRun.findUnique({
      where: { id: req.params.runId },
      include: { agent: { select: { name: true, type: true } } }
    });
    if (!run) return res.status(404).json({ message: 'Run not found' });
    res.json(run);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/agents/alerts — all agent alerts
router.get('/alerts/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const alerts = await prisma.agentAlert.findMany({
      include: { agent: { select: { name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/agents/alerts/:id/read
router.patch('/alerts/:id/read', auth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.agentAlert.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
