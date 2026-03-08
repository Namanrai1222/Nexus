import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
        id: string;
        role: string;
      };
      socket.data.userId = payload.id;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Join user's personal notification room
    socket.join(`user:${userId}`);

    // Post rooms for live comments
    socket.on('join-post', (postId: string) => {
      socket.join(`post:${postId}`);
      console.log(`[Socket] User ${userId} joined post:${postId}`);
    });

    socket.on('leave-post', (postId: string) => {
      socket.leave(`post:${postId}`);
      console.log(`[Socket] User ${userId} left post:${postId}`);
    });

    // Community rooms
    socket.on('join-community', (communityId: string) => {
      socket.join(`community:${communityId}`);
    });

    socket.on('leave-community', (communityId: string) => {
      socket.leave(`community:${communityId}`);
    });

    // New comment event — broadcast to all in the post room
    socket.on('new-comment', (data: { postId: string; comment: unknown }) => {
      io.to(`post:${data.postId}`).emit('comment-added', data.comment);
    });

    // Vote update event
    socket.on('vote-update', (data: { postId: string; score: number }) => {
      io.to(`post:${data.postId}`).emit('score-updated', {
        postId: data.postId,
        score: data.score,
      });
    });

    // Mod room
    if (socket.data.role === 'MODERATOR' || socket.data.role === 'ADMIN') {
      socket.join('mod-room');
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });

  return io;
};
