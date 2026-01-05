import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../config/logger';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      logger.info(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const socketService = {
  sendToUser(userId: string, event: string, data: any) {
    if (io) {
      io.to(userId).emit(event, data);
    }
  },
  
  sendToInstitution(institutionId: string, event: string, data: any) {
    if (io) {
      io.to(`institution-${institutionId}`).emit(event, data);
    }
  }
};
