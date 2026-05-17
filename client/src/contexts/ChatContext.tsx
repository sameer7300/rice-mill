import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api';

const SOCKET_URL = 'http://localhost:5000';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderName: string;
  senderRole: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  guestName?: string;
  guestEmail?: string;
  guestId?: string;
  customerId?: string;
  status: string;
  subject?: string;
  unreadAdmin: number;
  unreadUser: number;
  lastMessageAt?: string;
  createdAt: string;
  messages?: ChatMessage[];
  customer?: any;
}

interface ChatContextType {
  // Socket
  socket: Socket | null;
  connected: boolean;
  adminOnline: boolean;
  // Widget state (customer-facing)
  widgetOpen: boolean;
  setWidgetOpen: (v: boolean) => void;
  unreadCount: number;
  // Current conversation
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  typingInfo: { name: string; role?: string; isTyping: boolean } | null;
  // Actions
  startConversation: (opts: { guestName?: string; guestEmail?: string; guestId?: string; customerId?: string; subject?: string }) => Promise<ChatConversation>;
  sendMessage: (text: string) => void;
  sendTyping: (isTyping: boolean) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  joinConversation: (conversationId: string) => void;
  // Admin
  resolveConversation: (conversationId: string) => void;
  reopenConversation: (conversationId: string) => void;
  // Admin conversation list updates
  onConversationUpdate: (cb: (data: any) => void) => () => void;
  // Admin unread badge
  adminUnreadCount: number;
  clearAdminUnread: () => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children, token }: { children: ReactNode; token?: string }) {
  const socketRef         = useRef<Socket | null>(null);
  const [connected, setConnected]     = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [widgetOpen, setWidgetOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversation, setConv]       = useState<ChatConversation | null>(null);
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [typingInfo, setTyping]       = useState<{ name: string; role?: string; isTyping: boolean } | null>(null);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const updateCallbacks = useRef<Set<(data: any) => void>>(new Set());
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Connect socket ──────────────────────────────────────────────────────────
  useEffect(() => {
    const sock = io(SOCKET_URL, {
      auth: token ? { token } : {},
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = sock;

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));

    sock.on('admin_status', ({ online }: { online: boolean }) => setAdminOnline(online));

    sock.on('receive_message', (msg: ChatMessage) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // If widget is closed and message is from admin, increment unread
      if (msg.senderRole === 'admin' || msg.senderRole === 'staff') {
        setUnreadCount(n => n + 1);
      }
    });

    sock.on('typing', (info: { name: string; isTyping: boolean }) => {
      setTyping(info.isTyping ? info : null);
      if (info.isTyping) {
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(null), 4000);
      }
    });

    sock.on('messages_read', () => setUnreadCount(0));

    sock.on('conversation_status', ({ conversationId, status }: any) => {
      setConv(c => c?.id === conversationId ? { ...c, status } : c);
    });

    // For admin: conversation list live updates
    sock.on('conversation_updated', (data: any) => {
      updateCallbacks.current.forEach(cb => cb({ type: 'updated', ...data }));
    });

    sock.on('new_message', (data: any) => {
      updateCallbacks.current.forEach(cb => cb({ type: 'new_message', ...data }));
      setAdminUnreadCount(n => n + 1);
    });

    return () => {
      sock.disconnect();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [token]);

  // ── Start or resume conversation ───────────────────────────────────────────
  const startConversation = useCallback(async (opts: {
    guestName?: string; guestEmail?: string; guestId?: string; customerId?: string; subject?: string;
  }) => {
    const { data } = await api.post('/chat/start', opts);
    const conv: ChatConversation = data.data;
    setConv(conv);
    socketRef.current?.emit('join_conversation', { conversationId: conv.id });
    return conv;
  }, []);

  // ── Load messages ──────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (conversationId: string) => {
    const { data } = await api.get(`/chat/${conversationId}/messages`);
    setMessages(data.data || []);
    setUnreadCount(0);
  }, []);

  // ── Join conversation room ─────────────────────────────────────────────────
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', { conversationId });
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback((text: string) => {
    if (!conversation?.id || !text.trim()) return;
    socketRef.current?.emit('send_message', {
      conversationId: conversation.id,
      message: text.trim(),
    });
    socketRef.current?.emit('typing_stop', { conversationId: conversation.id });
  }, [conversation]);

  // ── Typing ────────────────────────────────────────────────────────────────
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!conversation?.id) return;
    const event = isTyping ? 'typing_start' : 'typing_stop';
    socketRef.current?.emit(event, { conversationId: conversation.id });
  }, [conversation]);

  // ── Admin actions ─────────────────────────────────────────────────────────
  const resolveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('resolve_conversation', { conversationId });
  }, []);

  const reopenConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('reopen_conversation', { conversationId });
  }, []);

  // ── Subscribe to admin conversation updates ────────────────────────────────
  const onConversationUpdate = useCallback((cb: (data: any) => void) => {
    updateCallbacks.current.add(cb);
    return () => updateCallbacks.current.delete(cb);
  }, []);

  const clearAdminUnread = useCallback(() => setAdminUnreadCount(0), []);

  // Reset unread when widget opens
  useEffect(() => {
    if (widgetOpen) setUnreadCount(0);
  }, [widgetOpen]);

  return (
    <ChatContext.Provider value={{
      socket: socketRef.current,
      connected,
      adminOnline,
      widgetOpen,
      setWidgetOpen,
      unreadCount,
      conversation,
      messages,
      typingInfo,
      startConversation,
      sendMessage,
      sendTyping,
      loadMessages,
      joinConversation,
      resolveConversation,
      reopenConversation,
      onConversationUpdate,
      adminUnreadCount,
      clearAdminUnread,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
