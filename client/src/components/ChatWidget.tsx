import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Wheat, Circle, ChevronDown } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/export';

const GUEST_ID_KEY = 'rice_mill_guest_chat_id';

function getOrCreateGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) { id = 'guest_' + Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem(GUEST_ID_KEY, id); }
  return id;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ChatWidget() {
  const { user, isCustomer } = useAuth();
  const {
    widgetOpen, setWidgetOpen, unreadCount, adminOnline,
    conversation, messages, typingInfo, startConversation,
    sendMessage, sendTyping, loadMessages, joinConversation,
  } = useChat();

  const [step, setStep]             = useState<'init' | 'form' | 'chat'>('init');
  const [guestName, setGN]          = useState('');
  const [guestEmail, setGE]         = useState('');
  const [inputMsg, setInputMsg]     = useState('');
  const [starting, setStarting]     = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);
  const typingTimeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingInfo]);

  // When widget opens, jump to correct step
  useEffect(() => {
    if (!widgetOpen) return;
    if (conversation) {
      setStep('chat');
      loadMessages(conversation.id);
      joinConversation(conversation.id);
    } else if (isCustomer || user) {
      setStep('form');
    } else {
      setStep('form');
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [widgetOpen]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (starting) return;
    setStarting(true);
    try {
      const guestId = getOrCreateGuestId();
      const conv = await startConversation({
        guestName: isCustomer ? (user?.name || guestName) : guestName,
        guestEmail: isCustomer ? user?.email : guestEmail,
        guestId: isCustomer ? undefined : guestId,
        customerId: isCustomer && (user as any)?.customer?.id ? (user as any).customer.id : undefined,
        subject: 'Customer Support',
      });
      await loadMessages(conv.id);
      setStep('chat');
    } catch { } finally { setStarting(false); }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg);
    setInputMsg('');
    sendTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
  };

  const handleInputChange = (v: string) => {
    setInputMsg(v);
    if (!isTyping) { sendTyping(true); setIsTyping(true); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { sendTyping(false); setIsTyping(false); }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat window */}
      <AnimatePresence>
        {widgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden border border-gray-100 flex flex-col"
            style={{ height: 520 }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wheat size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Al-Noor Rice Mills</p>
                <div className="flex items-center gap-1.5">
                  <Circle size={7} className={`fill-current ${adminOnline ? 'text-green-300' : 'text-gray-400'}`} />
                  <p className="text-green-200 text-xs">{adminOnline ? 'Online — usually replies in minutes' : 'Offline — leave a message'}</p>
                </div>
              </div>
              <button onClick={() => setWidgetOpen(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="p-5 space-y-4">
                    <div className="text-center pt-2">
                      <div className="text-4xl mb-3">👋</div>
                      <p className="font-bold text-gray-900">Hi there!</p>
                      <p className="text-gray-500 text-sm mt-1">Have a question about our rice? We're here to help.</p>
                    </div>
                    <form onSubmit={handleStart} className="space-y-3 mt-4">
                      {!isCustomer && (
                        <>
                          <input type="text" value={guestName} onChange={e => setGN(e.target.value)} required
                            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                            placeholder="Your name *" />
                          <input type="email" value={guestEmail} onChange={e => setGE(e.target.value)}
                            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                            placeholder="Email (optional)" />
                        </>
                      )}
                      {isCustomer && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 flex items-center gap-2">
                          <Wheat size={14} className="text-green-600 flex-shrink-0" />
                          Chatting as <strong>{user?.name}</strong>
                        </div>
                      )}
                      <button type="submit" disabled={starting || (!isCustomer && !guestName.trim())}
                        className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        {starting ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting...</>
                          : 'Start Chat →'}
                      </button>
                    </form>
                    {/* Quick topics */}
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Popular topics</p>
                      {['Rice prices & varieties', 'Delivery & shipping', 'Bulk / wholesale inquiry', 'Order status'].map(topic => (
                        <button key={topic} onClick={() => { if (!guestName && !isCustomer) return; setGN(guestName || user?.name || ''); }}
                          className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-xl text-sm text-gray-600 transition-colors border border-gray-100">
                          {topic}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col" style={{ minHeight: 380 }}>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {messages.length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-3xl mb-2">💬</div>
                          <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                        </div>
                      )}
                      {messages.map((msg, i) => {
                        const isOwn = msg.senderRole === 'customer' || msg.senderRole === 'guest';
                        const showTime = i === 0 || (new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 300000);
                        return (
                          <div key={msg.id}>
                            {showTime && (
                              <p className="text-center text-[10px] text-gray-400 my-2">{formatTime(msg.createdAt)}</p>
                            )}
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
                              {!isOwn && (
                                <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-auto">
                                  <Wheat size={12} className="text-white" />
                                </div>
                              )}
                              <div className={`max-w-[78%] ${isOwn ? 'order-first' : ''}`}>
                                {!isOwn && i === 0 && <p className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</p>}
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isOwn
                                    ? 'bg-green-700 text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                }`}>
                                  {msg.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Typing indicator */}
                      {typingInfo?.isTyping && (typingInfo.role === 'admin' || typingInfo.role === 'staff') && (
                        <div className="flex gap-2 items-end">
                          <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <Wheat size={12} className="text-white" />
                          </div>
                          <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                            {[0, 0.2, 0.4].map(d => (
                              <motion.div key={d} animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            ))}
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            {step === 'chat' && (
              <form onSubmit={handleSend} className="px-3 py-3 border-t border-gray-100 flex gap-2">
                <input ref={inputRef} type="text" value={inputMsg} onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-2xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  placeholder="Type a message..." />
                <motion.button type="submit" disabled={!inputMsg.trim()}
                  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0">
                  <Send size={15} />
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        onClick={() => setWidgetOpen(!widgetOpen)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        className="relative w-14 h-14 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center transition-colors"
        style={{ willChange: 'transform' }}>
        <AnimatePresence mode="wait">
          {widgetOpen
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <ChevronDown size={22} />
              </motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle size={22} />
              </motion.div>
          }
        </AnimatePresence>
        {/* Unread badge */}
        {unreadCount > 0 && !widgetOpen && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        {/* Online pulse */}
        {adminOnline && !widgetOpen && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
            <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
