import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import api from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  "What's my stock situation?",
  "How was this month's performance?",
  "Which customers owe the most?",
  "When should I reorder paddy?",
  "What's my net profit?",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "👋 Hello! I'm your AI business assistant. I have real-time access to your rice mill data — inventory, orders, finances, and more. Ask me anything!"
        }]);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        messages: newMessages.filter(m => m.role !== 'assistant' || m !== newMessages[0])
          .map(m => ({ role: m.role, content: m.content }))
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'AI unavailable. Make sure ANTHROPIC_API_KEY is set in server/.env';
      if (msg.includes('API key')) setHasApiKey(false);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-colors"
        title="AI Business Assistant"
      >
        {open ? <ChevronDown size={22} /> : <Bot size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[580px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">AI Business Assistant</p>
                  <p className="text-green-200 text-xs">Powered by Claude</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {!hasApiKey && (
              <div className="mx-3 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
                <p className="font-semibold">Setup needed:</p>
                <p>Add your API key to <code className="bg-yellow-100 px-1 rounded">server/.env</code>:</p>
                <code className="block mt-1 bg-yellow-100 px-2 py-1 rounded font-mono">ANTHROPIC_API_KEY=sk-ant-...</code>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Bot size={14} className="text-green-700" />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-green-700" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                    <div className="ai-dot w-2 h-2 bg-green-500 rounded-full" />
                    <div className="ai-dot w-2 h-2 bg-green-500 rounded-full" />
                    <div className="ai-dot w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2">
                <p className="text-xs text-gray-400 mb-1.5 px-1">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => send(p)}
                      className="text-xs bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-600 px-2.5 py-1 rounded-full transition-colors border border-transparent hover:border-green-200">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 dark:border-slate-600 p-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about your business..."
                className="flex-1 text-sm bg-gray-100 dark:bg-slate-700 border-0 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
