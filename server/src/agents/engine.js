const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');
const { DATA_TOOLS, ACTION_TOOLS, executeTool } = require('./tools');
const { AGENT_PRESETS } = require('./presets');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const prisma = new PrismaClient();

const MAX_ITERATIONS = 12;
const RUNNING_AGENTS = new Map(); // agentId -> { runId, abortController }

async function runAgent(agentId, task, adminUserId) {
  // Prevent duplicate runs
  if (RUNNING_AGENTS.has(agentId)) {
    throw new Error('Agent is already running');
  }

  // Load agent
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new Error('Agent not found');

  // Create run record
  const run = await prisma.agentRun.create({
    data: { agentId, status: 'running', task: task || agent.instructions || null }
  });

  // Mark agent as running
  await prisma.agent.update({
    where: { id: agentId },
    data: { lastStatus: 'running', lastRunAt: new Date() }
  });

  RUNNING_AGENTS.set(agentId, { runId: run.id });

  // Run asynchronously — don't block the HTTP response
  executeAgentLoop(agent, run, task).catch(err => {
    console.error(`Agent ${agent.name} failed:`, err.message);
  });

  return run;
}

async function executeAgentLoop(agent, run, customTask) {
  const preset = AGENT_PRESETS[agent.type] || AGENT_PRESETS.custom;
  const systemPrompt = preset.systemPrompt(agent.instructions);
  const userTask = customTask || preset.defaultTask;

  const tools = agent.autoActions
    ? [...DATA_TOOLS, ...ACTION_TOOLS]
    : DATA_TOOLS;

  const messages = [{ role: 'user', content: userTask }];
  const actionsTaken = [];
  const toolCallLog = [];
  let iterations = 0;
  let finalText = '';

  try {
    while (iterations < MAX_ITERATIONS) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages
      });

      iterations++;

      // Extract any text content
      const textBlock = response.content.find(c => c.type === 'text');
      if (textBlock) finalText = textBlock.text;

      // Agent is done
      if (response.stop_reason === 'end_turn') break;

      // Agent wants to use tools
      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content });
        const toolResults = [];

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;

          toolCallLog.push({ tool: block.name, input: block.input, iteration: iterations });

          let result;
          try {
            result = await executeTool(block.name, block.input, agent.id);
          } catch (err) {
            result = { error: err.message };
          }

          // Track action tools
          const isAction = ACTION_TOOLS.some(t => t.name === block.name);
          if (isAction) {
            actionsTaken.push({
              tool: block.name,
              input: block.input,
              result,
              timestamp: new Date().toISOString()
            });
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
        }

        messages.push({ role: 'user', content: toolResults });
      }
    }

    // Parse final result into structured sections
    const structured = parseAgentResult(finalText);

    // Save completed run
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        result: JSON.stringify(structured),
        actions: JSON.stringify(actionsTaken),
        toolCalls: toolCallLog.length,
        endedAt: new Date()
      }
    });

    await prisma.agent.update({
      where: { id: agent.id },
      data: { lastStatus: 'completed' }
    });

  } catch (err) {
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        result: JSON.stringify({ error: err.message, raw: finalText }),
        endedAt: new Date()
      }
    });
    await prisma.agent.update({
      where: { id: agent.id },
      data: { lastStatus: 'failed' }
    });
  } finally {
    RUNNING_AGENTS.delete(agent.id);
  }
}

function parseAgentResult(text) {
  if (!text) return { raw: '' };
  // Try to extract key sections from the markdown response
  const sections = {};
  const lines = text.split('\n');
  let currentSection = 'summary';
  let buffer = [];

  for (const line of lines) {
    const heading = line.match(/^#+\s+(.+)/);
    if (heading) {
      if (buffer.length) sections[currentSection] = buffer.join('\n').trim();
      currentSection = heading[1].toLowerCase().replace(/[^a-z0-9]/g, '_');
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length) sections[currentSection] = buffer.join('\n').trim();
  return { ...sections, raw: text };
}

async function stopAgent(agentId) {
  const running = RUNNING_AGENTS.get(agentId);
  if (!running) return false;
  // Mark as failed in DB (the loop will complete its current iteration)
  RUNNING_AGENTS.delete(agentId);
  await prisma.agentRun.updateMany({
    where: { agentId, status: 'running' },
    data: { status: 'failed', endedAt: new Date() }
  });
  await prisma.agent.update({
    where: { id: agentId },
    data: { lastStatus: 'idle' }
  });
  return true;
}

function isRunning(agentId) {
  return RUNNING_AGENTS.has(agentId);
}

module.exports = { runAgent, stopAgent, isRunning };
