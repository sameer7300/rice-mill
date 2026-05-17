import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Search, Circle, CheckCircle2, RefreshCw, Wheat, X, User, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import api from '../api';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

const STATUS_COLORS: Record<string, string> = { guest: '#6b7280', customer: '#16a34a', admin: '#7c3aed', staff: '#2563eb' };

export default function DashboardChat() {
  const { messages, typingInfo, sendMessageTo, sendTypingTo, loadMessages, joinConversation, resolveConversation, reopenConversation, onConversationUpdate, clearAdminUnread } = useChat();

  const [conversations, setConvs]       = useState<any[]>([]);
  const [active, setActive]             = useState<any>(null);
  const [statusFilter, setSF]           = useState<'open' | 'resolved' | 'all'>('open');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [stats, setStats]               = useState<any>({});
  const [inputMsg, setInputMsg]         = useState('');
  const [isTypingLocal, setITL]         = useState(false);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const typingTimer                     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  // Clear admin unread badge when this page is open
  useEffect(() => { clearAdminUnread(); }, [clearAdminUnread]);

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingInfo]);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const [convRes, statsRes] = await Promise.all([
        api.get(`/chat/admin/conversations?status=${statusFilter}&q=${encodeURIComponent(search)}`),
        api.get('/chat/admin/stats'),
      ]);
      setConvs(convRes.data.data?.conversations || []);
      setStats(statsRes.data.data || {});
    } finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Live updates from socket
  useEffect(() => {
    return onConversationUpdate((data) => {
      if (data.type === 'updated' || data.type === 'new_message') {
        // Move the updated conversation to top + increment unread
        setConvs(prev => {
          const idx = prev.findIndex(c => c.id === data.conversationId);
          if (idx === -1) {
            loadConversations();
            return prev;
          }
          const updated = {
            ...prev[idx],
            unreadAdmin: data.unreadAdmin ?? prev[idx].unreadAdmin,
            lastMessageAt: new Date().toISOString(),
            messages: data.lastMessage ? [data.lastMessage] : prev[idx].messages,
          };
          const rest = prev.filter((_, i) => i !== idx);
          return [updated, ...rest];
        });
        setStats((s: any) => ({ ...s, unread: (s.unread || 0) + 1 }));
      }
    });
  }, [onConversationUpdate, loadConversations]);

  const openConversation = async (conv: any) => {
    setActive(conv);
    joinConversation(conv.id);
    await loadMessages(conv.id);
    // Mark as read in list
    setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unreadAdmin: 0 } : c));
    setStats((s: any) => ({ ...s, unread: Math.max(0, (s.unread || 0) - (conv.unreadAdmin || 0)) }));
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMsg.trim() || !active) return;
    sendMessageTo(active.id, inputMsg);
    setInputMsg('');
    sendTypingTo(active.id, false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setITL(false);
  };

  const handleTyping = (v: string) => {
    setInputMsg(v);
    if (!isTypingLocal) { sendTypingTo(active.id, true); setITL(true); }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { sendTypingTo(active.id, false); setITL(false); }, 2000);
  };

  const handleResolve = () => {
    if (!active) return;
    resolveConversation(active.id);
    setActive((a: any) => ({ ...a, status: 'resolved' }));
    setConvs(prev => prev.map(c => c.id === active.id ? { ...c, status: 'resolved' } : c));
    toast.success('Conversation resolved');
  };

  const handleReopen = () => {
    if (!active) return;
    reopenConversation(active.id);
    setActive((a: any) => ({ ...a, status: 'open' }));
    setConvs(prev => prev.map(c => c.id === active.id ? { ...c, status: 'open' } : c));
    toast.success('Conversation reopened');
  };

  const handleDelete = async () => {
    if (!active || !confirm('Delete this conversation permanently?')) return;
    await api.delete(`/chat/admin/${active.id}`);
    toast.success('Deleted');
    setActive(null);
    setConvs(prev => prev.filter(c => c.id !== active.id));
  };

  const displayName = (conv: any) =>
    conv.customer?.user?.name || conv.guestName || 'Anonymous';

  const lastMsg = (conv: any) =>
    conv.messages?.[0]?.message || 'No messages yet';

  return (
    <>
    <div className="flex h-[calc(100vh-88px)] -m-6 overflow-hidden">
      {/* ── LEFT PANEL: Conversation List ─────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={18} className="text-green-600" /> Live Chat
              {stats.unread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{stats.unread}</span>
              )}
            </h1>
            <button onClick={loadConversations} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Stats mini row */}
          <div className="flex gap-2 mb-3">
            {[
              { label: 'Open', val: stats.open || 0, color: 'bg-green-100 text-green-700' },
              { label: 'Resolved', val: stats.resolved || 0, color: 'bg-gray-100 text-gray-600' },
              { label: 'Unread', val: stats.unread || 0, color: 'bg-red-100 text-red-600' },
            ].map(s => (
              <div key={s.label} className={`flex-1 text-center py-1.5 rounded-xl text-xs font-semibold ${s.color}`}>
                <p className="text-base font-extrabold leading-tight">{s.val}</p>
                <p>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-green-400 transition-colors" />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 mt-2">
            {(['open', 'resolved', 'all'] as const).map(s => (
              <button key={s} onClick={() => setSF(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${statusFilter === s ? 'bg-green-700 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">No {statusFilter !== 'all' ? statusFilter : ''} conversations</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map(conv => (
                <motion.button key={conv.id} onClick={() => openConversation(conv)}
                  whileHover={{ x: 2 }}
                  className={`w-full text-left px-3 py-3 rounded-2xl transition-all ${
                    active?.id === conv.id ? 'bg-green-50 border-2 border-green-200' : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}>
                  <div className="flex items-start gap-2.5">
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {displayName(conv)[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName(conv)}</p>
                        {conv.unreadAdmin > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadAdmin > 9 ? '9+' : conv.unreadAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{lastMsg(conv)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-400">{conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}</p>
                      <div className={`mt-1 w-2 h-2 rounded-full mx-auto ${conv.status === 'open' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Active Conversation ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <MessageCircle size={36} className="text-green-300" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Select a Conversation</h2>
              <p className="text-gray-400 text-sm max-w-xs">Click on a conversation from the left panel to start replying</p>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                {displayName(active)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{displayName(active)}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {active.guestEmail && <span>{active.guestEmail}</span>}
                  {active.customer?.user?.email && <span>{active.customer.user.email}</span>}
                  <span className={`flex items-center gap-1 ${active.status === 'open' ? 'text-green-600' : 'text-gray-400'}`}>
                    <Circle size={6} className="fill-current" /> {active.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {active.status === 'open' ? (
                  <button onClick={handleResolve}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-semibold transition-colors">
                    <CheckCircle2 size={13} /> Resolve
                  </button>
                ) : (
                  <button onClick={handleReopen}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors">
                    <RotateCcw size={13} /> Reopen
                  </button>
                )}
                <button onClick={handleDelete} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Clock size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages yet — reply to start</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'staff';
                const showSender = i === 0 || messages[i - 1].senderRole !== msg.senderRole;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} gap-2.5`}>
                    {!isAdmin && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-auto text-white font-bold text-xs">
                        {msg.senderName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[72%]`}>
                      {showSender && (
                        <p className={`text-[10px] text-gray-400 mb-1 ${isAdmin ? 'text-right' : ''}`}>
                          {msg.senderName} · {new Date(msg.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isAdmin ? 'bg-green-700 text-white rounded-br-sm' : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-auto">
                        <Wheat size={14} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {/* Typing */}
              {typingInfo?.isTyping && typingInfo.role !== 'admin' && typingInfo.role !== 'staff' && (
                <div className="flex gap-2.5 items-end">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-xs">?</div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5">
                    {[0, 0.2, 0.4].map(d => (
                      <motion.div key={d} animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            {active.status === 'open' ? (
              <form onSubmit={handleSend} className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
                <input ref={inputRef} type="text" value={inputMsg} onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors"
                  placeholder="Type your reply..." />
                <motion.button type="submit" disabled={!inputMsg.trim()} whileTap={{ scale: 0.92 }}
                  className="w-10 h-10 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0">
                  <Send size={15} />
                </motion.button>
              </form>
            ) : (
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 text-center text-sm text-gray-400">
                Conversation resolved — <button onClick={handleReopen} className="text-green-600 hover:underline font-medium">Reopen to reply</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
