import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatMessage from '../models/ChatMessage.js';

export const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const jwtSecret = process.env.JWT_SECRET || 'bloodbridge_default_jwt_secret_change_in_production';
      const decoded = jwt.verify(token, jwtSecret);

      const user = await User.findById(decoded.id).select('_id fullName bloodGroup phone');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid socket connection token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket] User connected: ${socket.user.fullName} (${userId})`);

    // Auto-join personal notification room
    socket.join(`user:${userId}`);

    // Client explicitly joins personal room (if reconnecting)
    socket.on('register:user', (data = {}) => {
      const targetId = data?.userId || userId;
      socket.join(`user:${targetId}`);
      console.log(`[Socket] User joined personal room: user:${targetId}`);
    });

    // Join an emergency coordination room
    socket.on('join:request', (data = {}) => {
      const requestId = data?.requestId;
      if (requestId && requestId !== 'undefined') {
        socket.join(`request:${requestId}`);
        console.log(`[Socket] User ${socket.user.fullName} joined request room: request:${requestId}`);
      }
    });

    // Leave an emergency coordination room
    socket.on('leave:request', (data = {}) => {
      const requestId = data?.requestId;
      if (requestId && requestId !== 'undefined') {
        socket.leave(`request:${requestId}`);
        console.log(`[Socket] User ${socket.user.fullName} left request room: request:${requestId}`);
      }
    });

    // In-app real-time chat message
    socket.on('chat:send', async (data = {}) => {
      try {
        const { requestId, message } = data || {};
        if (!requestId || !message || !message.trim()) return;
        if (!mongoose.Types.ObjectId.isValid(requestId)) return;

        const chatRecord = await ChatMessage.create({
          requestId,
          senderId: socket.user._id,
          message: message.trim(),
        });

        const payload = {
          _id: chatRecord._id,
          requestId,
          senderId: {
            _id: socket.user._id,
            fullName: socket.user.fullName,
            phone: socket.user.phone,
            bloodGroup: socket.user.bloodGroup,
          },
          message: chatRecord.message,
          createdAt: chatRecord.createdAt,
        };

        io.to(`request:${requestId}`).emit('chat:message', payload);
      } catch (err) {
        console.error('[Socket] Chat error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.fullName}`);
    });
  });
};

