import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, X, Wheat } from 'lucide-react';
import Modal from '../ui/Modal';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

interface ChatModalProps {
  conversationId?: string;
  contextType?: string;
  contextRef?: string;
  contextLabel?: string;
  initialMessage?: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const POLL_INTERVAL = 3000;

export default function ChatModal({
  conversationId: initialConvId,
  contextType,
  contextRef,
  contextLabel,
  initialMessage = '',
  isOpen,
  onClose,
}: ChatModalProps) {
  const { user } = useAuth();
  const { sendMessageTo } = useChat();

  const [convId, setConvId] = useState<string | null>(initialConvId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(!!initialConvId);

  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadMessages = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/chat/${id}/messages`);
      setMessages(res.data.data || []);
    } catch { }
  }, []);

  // Start polling when we have a conversation open
  useEffect(() => {
    if (!isOpen || !convId) return;
    loadMessages(convId);
    pollRef.current = setInterval(() => loadMessages(convId), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isOpen, convId, loadMessages]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, started]);

  const handleStart = async () => {
    if (!user && !guestName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/chat/start', {
        guestName: user ? undefined : guestName,
        guestEmail: user ? undefined : guestEmail,
        customerId: user?.role === 'customer' ? (user as any)?.customer?.id : undefined,
        subject: contextLabel || contextType || 'Customer Support',
      });
      const conv = res.data.data;
      setConvId(conv.id);
      setStarted(true);
      await loadMessages(conv.id);
      // Send initial message if provided
      if (input.trim()) {
        await sendFirstMessage(conv.id, input.trim());
        setInput('');
      }
    } catch { } finally { setLoading(false); }
  };

  const sendFirstMessage = async (id: string, text: string) => {
    sendMessageTo(id, text);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      message: text,
      senderRole: user?.role || 'guest',
      senderName: user?.name || guestName,
      createdAt: new Date().toISOString(),
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !convId) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      sendMessageTo(convId, text);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: text,
        senderRole: user?.role || 'guest',
        senderName: user?.name || guestName,
        createdAt: new Date().toISOString(),
      }]);
    } finally { setSending(false); }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={contextLabel ? `Chat — ${contextLabel}` : 'Chat with Support'}
      onClose={onClose}
      size="md">
      <div className="flex flex-col" style={{ height: 420 }}>

        {/* Context label */}
        {contextLabel && (
          <div className="flex items-center gap-2 mb-3 px-1 py-1.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
            <MessageCircle size={13} className="text-green-600" />
            Regarding: <span className="font-bold">{contextLabel}</span>
          </div>
        )}

        {!started ? (
          /* Identify step */
          <div className="flex-1 flex flex-col justify-center space-y-4 px-1">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wheat size={26} className="text-green-700" />
              </div>
              <p className="font-bold text-gray-900 text-base">Hi there! 👋</p>
              <p className="text-gray-500 text-sm mt-1">
                {user ? `Chatting as ${user.name}` : 'Tell us who you are to start'}
              </p>
            </div>

            {!user && (
              <>
                <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                  placeholder="Your name *"
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors" />
                <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors" />
              </>
            )}

            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder={initialMessage || 'Your first message...'}
              onKeyDown={e => { if (e.key === 'Enter') handleStart(); }}
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors" />

            <button onClick={handleStart}
              disabled={loading || (!user && !guestName.trim())}
              className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting...</>
                : 'Start Chat →'}
            </button>
          </div>
        ) : (
          /* Chat view */
          <>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              )}
              {messages.map((msg: any) => {
                const isOwn = msg.senderRole === 'customer' || msg.senderRole === 'guest' || msg.senderRole === 'supplier';
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
                    {!isOwn && (
                      <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-auto">
                        <Wheat size={12} className="text-white" />
                      </div>
                    )}
                    <div className="max-w-[78%]">
                      <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isOwn ? 'bg-green-700 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.message || msg.content}
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-0.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                className="flex-1 border-2 border-gray-200 focus:border-green-500 rounded-2xl px-3.5 py-2.5 text-sm outline-none transition-colors" />
              <motion.button onClick={handleSend} disabled={!input.trim() || sending}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0">
                <Send size={15} />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
