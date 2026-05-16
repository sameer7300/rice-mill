import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, Plus, Trash2, Settings, ChevronRight, Clock,
  CheckCircle2, AlertTriangle, Loader2, Eye, RefreshCw, Zap,
  Bot, BarChart3, Package, ShoppingCart, Users, DollarSign,
  Factory, TrendingUp, Brain, Bell
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  inventory_monitor:   <Package size={18} className="text-yellow-500" />,
  order_processor:     <ShoppingCart size={18} className="text-blue-500" />,
  finance_analyst:     <DollarSign size={18} className="text-green-500" />,
  customer_relations:  <Users size={18} className="text-purple-500" />,
  mill_optimizer:      <Factory size={18} className="text-orange-500" />,
  demand_forecaster:   <TrendingUp size={18} className="text-indigo-500" />,
  custom:              <Brain size={18} className="text-pink-500" />
};

const TYPE_COLORS: Record<string, string> = {
  inventory_monitor:   'bg-yellow-50 border-yellow-200',
  order_processor:     'bg-blue-50 border-blue-200',
  finance_analyst:     'bg-green-50 border-green-200',
  customer_relations:  'bg-purple-50 border-purple-200',
  mill_optimizer:      'bg-orange-50 border-orange-200',
  demand_forecaster:   'bg-indigo-50 border-indigo-200',
  custom:              'bg-pink-50 border-pink-200'
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  idle:      { color: 'text-gray-400', icon: <Clock size={13} />, label: 'Idle' },
  running:   { color: 'text-blue-500', icon: <Loader2 size={13} className="animate-spin" />, label: 'Running' },
  completed: { color: 'text-green-500', icon: <CheckCircle2 size={13} />, label: 'Completed' },
  failed:    { color: 'text-red-500', icon: <AlertTriangle size={13} />, label: 'Failed' }
};

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [showRun, setShowRun] = useState<any>(null);
  const [showResult, setShowResult] = useState<any>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', type: 'inventory_monitor', description: '', instructions: '', schedule: 'manual', autoActions: false });
  const [runTask, setRunTask] = useState('');
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [ag, al] = await Promise.all([
        api.get('/agents'),
        api.get('/agents/alerts/all')
      ]);
      setAgents(ag.data);
      setAlerts(al.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPresets = async () => {
    const { data } = await api.get('/agents/presets');
    setPresets(data);
  };

  useEffect(() => {
    fetchAll();
    fetchPresets();
  }, [fetchAll]);

  // Poll running agents every 3 seconds
  useEffect(() => {
    const running = agents.filter(a => a.isRunning || a.lastStatus === 'running');
    if (running.length > 0) {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchAll, 3000);
      }
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [agents]);

  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/agents', createForm);
      toast.success('Agent created!');
      setShowCreate(false);
      setCreateForm({ name: '', type: 'inventory_monitor', description: '', instructions: '', schedule: 'manual', autoActions: false });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const runAgent = async (agent: any, task?: string) => {
    try {
      await api.post(`/agents/${agent.id}/run`, { task: task || null });
      toast.success(`${agent.name} started!`);
      setShowRun(null);
      setRunTask('');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error starting agent');
    }
  };

  const stopAgent = async (agent: any) => {
    await api.post(`/agents/${agent.id}/stop`);
    toast.success('Agent stopped');
    fetchAll();
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Delete this agent? All run history will be lost.')) return;
    await api.delete(`/agents/${id}`);
    toast.success('Deleted');
    fetchAll();
  };

  const viewLatestRun = async (agent: any) => {
    if (!agent.lastRun) return;
    const { data } = await api.get(`/agents/runs/${agent.lastRun.id}`);
    setShowResult(data);
  };

  const markAlertRead = async (id: string) => {
    await api.patch(`/agents/alerts/${id}/read`);
    setAlerts(a => a.map(al => al.id === id ? { ...al, isRead: true } : al));
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const selectedPreset = presets.find(p => p.type === createForm.type);

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title="AI Agents"
        subtitle={`${agents.length} agents — ${agents.filter(a => a.isRunning).length} running now`}
        actions={
          <>
            <button onClick={() => setShowAlerts(true)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors">
              <RefreshCw size={16} />
            </button>
            <ActionButton onClick={() => setShowCreate(true)} icon={<Plus size={15} />} label="New Agent" />
          </>
        }
      />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl text-sm">
        <Bot size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800">Autonomous AI Agents</p>
          <p className="text-blue-600 mt-0.5">Each agent uses Claude's tool-use to gather live business data, reason about it, and optionally take actions. Enable <strong>Auto Actions</strong> to allow an agent to update orders, flag customers, and create alerts automatically.</p>
        </div>
      </div>

      {/* Agent grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bot size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No agents yet</p>
          <p className="text-sm mt-1">Create your first AI agent to start automating your rice mill operations.</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
            Create First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => {
            const status = agent.isRunning ? 'running' : (agent.lastStatus || 'idle');
            const sc = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
            const cardColor = TYPE_COLORS[agent.type] || 'bg-gray-50 border-gray-200';
            return (
              <motion.div key={agent.id} layout
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${!agent.isActive ? 'opacity-60' : ''}`}>
                {/* Header strip */}
                <div className={`px-4 py-3 border-b ${cardColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border">
                        {TYPE_ICONS[agent.type] || <Bot size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{agent.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{agent.type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-xs text-gray-500 line-clamp-2">{agent.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={11} /> {agent.schedule}</span>
                    {agent.autoActions && <span className="flex items-center gap-1 text-orange-500"><Zap size={11} /> Auto-actions ON</span>}
                    <span className="flex items-center gap-1">{agent.totalRuns} runs</span>
                  </div>

                  {agent.lastRun && (
                    <div className={`text-xs px-2.5 py-1.5 rounded-xl flex items-center justify-between ${
                      agent.lastRun.status === 'completed' ? 'bg-green-50 text-green-700' :
                      agent.lastRun.status === 'failed' ? 'bg-red-50 text-red-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <span>Last run: {formatDate(agent.lastRun.startedAt)}</span>
                      <span>{agent.lastRun.toolCalls} tool calls</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  {agent.isRunning ? (
                    <button onClick={() => stopAgent(agent)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-medium transition-colors">
                      <Square size={13} /> Stop
                    </button>
                  ) : (
                    <button onClick={() => setShowRun(agent)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium transition-colors">
                      <Play size={13} /> Run Now
                    </button>
                  )}
                  {agent.lastRun?.status === 'completed' && (
                    <button onClick={() => viewLatestRun(agent)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200">
                      <Eye size={14} />
                    </button>
                  )}
                  <button onClick={() => setShowEdit(agent)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                    <Settings size={14} />
                  </button>
                  <button onClick={() => deleteAgent(agent.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create agent modal */}
      {showCreate && (
        <Modal title="Create New Agent" onClose={() => setShowCreate(false)} size="lg">
          <form onSubmit={createAgent} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Agent Name" required>
                <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="e.g. Daily Stock Monitor" />
              </FormField>
              <FormField label="Agent Type" required>
                <select value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                  {presets.map(p => <option key={p.type} value={p.type}>{p.icon} {p.label}</option>)}
                </select>
              </FormField>
            </div>

            {selectedPreset && (
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                <p className="font-semibold text-gray-700 mb-1">{selectedPreset.icon} {selectedPreset.label}</p>
                <p>{selectedPreset.description}</p>
              </div>
            )}

            <FormField label="Schedule">
              <select value={createForm.schedule} onChange={e => setCreateForm(f => ({ ...f, schedule: e.target.value }))} className={selectCls}>
                <option value="manual">Manual only</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </FormField>

            <FormField label="Custom Instructions (optional)">
              <textarea value={createForm.instructions} onChange={e => setCreateForm(f => ({ ...f, instructions: e.target.value }))}
                rows={3} className={inputCls} placeholder="Override the default behavior with your own instructions..." />
            </FormField>

            <div className="flex items-center gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
              <input type="checkbox" id="autoActions" checked={createForm.autoActions} onChange={e => setCreateForm(f => ({ ...f, autoActions: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
              <label htmlFor="autoActions" className="text-sm">
                <span className="font-semibold text-orange-700">Enable Auto-Actions</span>
                <span className="text-orange-600 ml-1">— Agent can update orders, flag customers, create alerts automatically</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Deploy Agent</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Run modal */}
      {showRun && (
        <Modal title={`Run: ${showRun.name}`} onClose={() => setShowRun(null)}>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                {TYPE_ICONS[showRun.type]}
                <span className="font-medium text-gray-700 capitalize">{showRun.type.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-gray-500">{showRun.description}</p>
              {showRun.autoActions && (
                <p className="text-orange-600 text-xs font-medium flex items-center gap-1"><Zap size={11} /> Auto-actions enabled — agent may update data</p>
              )}
            </div>

            <FormField label="Custom Task (optional — leave blank for default)">
              <textarea value={runTask} onChange={e => setRunTask(e.target.value)}
                rows={3} className={inputCls} placeholder={`Default: ${presets.find(p => p.type === showRun.type)?.defaultTask?.substring(0, 100)}...`} />
            </FormField>

            <div className="flex gap-3">
              <button onClick={() => setShowRun(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => runAgent(showRun, runTask || undefined)}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <Play size={15} /> Start Agent
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {showEdit && (
        <Modal title={`Edit: ${showEdit.name}`} onClose={() => setShowEdit(null)}>
          <EditAgentForm agent={showEdit} onSave={async (data) => {
            await api.put(`/agents/${showEdit.id}`, data);
            toast.success('Agent updated');
            setShowEdit(null);
            fetchAll();
          }} onCancel={() => setShowEdit(null)} />
        </Modal>
      )}

      {/* Result viewer modal */}
      {showResult && (
        <Modal title={`Result: ${showResult.agent?.name}`} onClose={() => setShowResult(null)} size="xl">
          <RunResultViewer run={showResult} />
        </Modal>
      )}

      {/* Alerts modal */}
      {showAlerts && (
        <Modal title="Agent Alerts" onClose={() => setShowAlerts(false)} size="lg">
          <div className="space-y-2">
            {alerts.length === 0 && <p className="text-center text-gray-400 py-8">No alerts from agents yet.</p>}
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-opacity ${alert.isRead ? 'opacity-50' : ''} ${
                alert.priority === 'critical' ? 'bg-red-50 border-red-200' :
                alert.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                'bg-blue-50 border-blue-100'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      alert.priority === 'critical' ? 'bg-red-200 text-red-700' :
                      alert.priority === 'high' ? 'bg-orange-200 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{alert.priority}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">by {alert.agent?.name} · {formatDate(alert.createdAt)}</p>
                </div>
                {!alert.isRead && (
                  <button onClick={() => markAlertRead(alert.id)} className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">✓</button>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}

function EditAgentForm({ agent, onSave, onCancel }: any) {
  const [form, setForm] = useState({
    name: agent.name,
    description: agent.description || '',
    instructions: agent.instructions || '',
    schedule: agent.schedule,
    isActive: agent.isActive,
    autoActions: agent.autoActions
  });
  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(form); }} className="space-y-4">
      <FormField label="Name"><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></FormField>
      <FormField label="Description"><input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></FormField>
      <FormField label="Custom Instructions">
        <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={3} className={inputCls} />
      </FormField>
      <FormField label="Schedule">
        <select value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} className={selectCls}>
          <option value="manual">Manual</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
        </select>
      </FormField>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-green-600" />
          <span className="text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.autoActions} onChange={e => setForm(f => ({ ...f, autoActions: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
          <span className="text-orange-700 font-medium">Auto-actions</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save</button>
      </div>
    </form>
  );
}

function RunResultViewer({ run }: { run: any }) {
  let result: any = {};
  let actions: any[] = [];
  try { result = JSON.parse(run.result || '{}'); } catch {}
  try { actions = JSON.parse(run.actions || '[]'); } catch {}

  return (
    <div className="space-y-4">
      {/* Run metadata */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        {[
          { label: 'Status', value: run.status, color: run.status === 'completed' ? 'text-green-600' : 'text-red-500' },
          { label: 'Tool Calls', value: run.toolCalls || 0, color: 'text-blue-600' },
          { label: 'Duration', value: run.endedAt ? `${Math.round((new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s` : 'N/A', color: 'text-gray-700' }
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-gray-400 mb-0.5">{m.label}</p>
            <p className={`font-bold text-base ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Actions taken */}
      {actions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Zap size={12} className="text-orange-500" /> Actions Taken ({actions.length})
          </p>
          <div className="space-y-1.5">
            {actions.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-orange-50 border border-orange-100 rounded-xl text-xs">
                <span className="font-mono bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{a.tool}</span>
                <span className="text-gray-600">{JSON.stringify(a.input).substring(0, 120)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result content */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Agent Report</p>
        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-gray-200">
          {result.raw || result.error || 'No result available'}
        </div>
      </div>
    </div>
  );
}
