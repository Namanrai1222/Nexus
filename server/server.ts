import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app';
import { initSocket } from './src/config/socket';
import { prisma } from './src/config/db';

const PORT = parseInt(process.env.PORT || '5000', 10);

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

// Make io available to controllers via app
app.set('io', io);

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected via Prisma');

    httpServer.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Socket] WebSocket server ready`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
