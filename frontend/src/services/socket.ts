import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './authApi';
import { apiBaseUrl } from './apiConfig';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket) return socket;

  const token = getAuthToken();
  socket = io(apiBaseUrl, {
    auth: {
      token,
    },
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
