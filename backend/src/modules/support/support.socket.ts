import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { logger } from '../../common/logger/index.js';

let io: SocketIOServer | null = null;

export function initSupportSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, '⚡ Support WebSocket client connected');

    // Join specific ticket room
    socket.on('join_ticket', (ticketId: string) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
        logger.info({ socketId: socket.id, ticketId }, 'Joined ticket room');
      }
    });

    // Leave ticket room
    socket.on('leave_ticket', (ticketId: string) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
        logger.info({ socketId: socket.id, ticketId }, 'Left ticket room');
      }
    });

    // Admins join the admin channel
    socket.on('join_admin_feed', () => {
      socket.join('admin_feed');
      logger.info({ socketId: socket.id }, 'Joined admin live feed');
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Support WebSocket client disconnected');
    });
  });

  return io;
}

export function broadcastNewMessage(ticketId: string, message: any) {
  if (io) {
    // Deliver to everyone inside the ticket room (both patron and admin)
    io.to(`ticket:${ticketId}`).emit('new_message', { ticketId, message });
    // Also notify all admin consoles so the sidebar previews update in real time
    io.to('admin_feed').emit('ticket_updated', {
      ticketId,
      lastMessage: message.text,
      time: 'Just now',
      updatedAt: new Date().toISOString(),
    });
  }
}

export function broadcastTicketStatus(ticketId: string, status: string) {
  if (io) {
    io.to(`ticket:${ticketId}`).emit('status_changed', { ticketId, status });
    io.to('admin_feed').emit('ticket_updated', {
      ticketId,
      status,
      updatedAt: new Date().toISOString(),
    });
  }
}

export function broadcastNewTicket(ticket: any) {
  if (io) {
    io.to('admin_feed').emit('new_ticket', ticket);
  }
}
