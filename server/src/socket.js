const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  // ─── Auth middleware ────────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        // guest — socket.user stays undefined
      }
    }
    next();
  });

  // ─── Track online admins ────────────────────────────────────────────────────
  const onlineAdmins = new Set();

  io.on('connection', async (socket) => {
    const isAdmin = socket.user?.role === 'admin' || socket.user?.role === 'staff';
    const isCustomer = socket.user?.role === 'customer';

    if (isAdmin) {
      socket.join('admin_room');
      onlineAdmins.add(socket.user.id);
      // Broadcast online status to all customers
      io.emit('admin_status', { online: onlineAdmins.size > 0 });
    }

    // Tell this socket the current admin online status
    socket.emit('admin_status', { online: onlineAdmins.size > 0 });

    // ── Join conversation room ───────────────────────────────────────────────
    socket.on('join_conversation', async ({ conversationId }) => {
      socket.join(`conv_${conversationId}`);
      socket.currentConversation = conversationId;

      // Mark messages read
      try {
        if (isAdmin) {
          await prisma.chatConversation.update({
            where: { id: conversationId },
            data: { unreadAdmin: 0 },
          });
        } else {
          await prisma.chatConversation.update({
            where: { id: conversationId },
            data: { unreadUser: 0 },
          });
        }
        // Notify the other side their messages were read
        socket.to(`conv_${conversationId}`).emit('messages_read', { conversationId });
      } catch {}
    });

    // ── Leave conversation room ──────────────────────────────────────────────
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conv_${conversationId}`);
    });

    // ── Send message ─────────────────────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, message }) => {
      if (!message?.trim() || !conversationId) return;

      try {
        const conv = await prisma.chatConversation.findUnique({ where: { id: conversationId } });
        if (!conv) return;

        const senderRole = socket.user?.role || 'guest';
        const senderName = isAdmin
          ? (socket.user.name || 'Support')
          : (conv.guestName || socket.user?.name || 'Customer');

        const msg = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: socket.user?.id || null,
            senderName,
            senderRole,
            message: message.trim(),
          },
        });

        // Update conversation last message + unread count
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            unreadAdmin: isAdmin ? { set: 0 } : { increment: 1 },
            unreadUser:  isAdmin ? { increment: 1 } : { set: 0 },
          },
        });

        // Broadcast to everyone in the conversation room
        io.to(`conv_${conversationId}`).emit('receive_message', msg);

        // Notify admins if customer sent (so unread badge updates)
        if (!isAdmin) {
          io.to('admin_room').emit('conversation_updated', {
            conversationId,
            lastMessage: msg,
            unreadAdmin: (conv.unreadAdmin || 0) + 1,
          });
        }
      } catch (err) {
        console.error('[Socket] send_message error:', err.message);
      }
    });

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        name: socket.user?.name || 'Customer',
        role: socket.user?.role || 'guest',
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        name: socket.user?.name || 'Customer',
        role: socket.user?.role || 'guest',
        isTyping: false,
      });
    });

    // ── Resolve/reopen conversation ──────────────────────────────────────────
    socket.on('resolve_conversation', async ({ conversationId }) => {
      if (!isAdmin) return;
      try {
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { status: 'resolved' },
        });
        io.to(`conv_${conversationId}`).emit('conversation_status', {
          conversationId,
          status: 'resolved',
        });
        io.to('admin_room').emit('conversation_status', {
          conversationId,
          status: 'resolved',
        });
      } catch {}
    });

    socket.on('reopen_conversation', async ({ conversationId }) => {
      if (!isAdmin) return;
      try {
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { status: 'open' },
        });
        io.to(`conv_${conversationId}`).emit('conversation_status', {
          conversationId,
          status: 'open',
        });
        io.to('admin_room').emit('conversation_status', {
          conversationId,
          status: 'open',
        });
      } catch {}
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (isAdmin && socket.user?.id) {
        onlineAdmins.delete(socket.user.id);
        io.emit('admin_status', { online: onlineAdmins.size > 0 });
      }
    });
  });

  return io;
}

module.exports = { setupSocket };
