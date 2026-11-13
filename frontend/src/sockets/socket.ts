import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || 'https://bloodbridge-7j3w.onrender.com';

let socket: Socket | null = null;
let currentToken: string | null = null;

type SocketListener = (s: Socket | null) => void;
const listeners = new Set<SocketListener>();

export const onSocketChange = (listener: SocketListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn(socket);
    } catch (e) {
      console.error('[Socket] Listener error:', e);
    }
  });
};

export const getSocket = (): Socket | null => socket;

export const connectSocket = (token: string): Socket => {
  if (socket && currentToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to BloodBridge server, ID:', socket?.id);
    notifyListeners();
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    notifyListeners();
  });

  notifyListeners();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
    console.log('[Socket] Disconnected and cleaned up');
    notifyListeners();
  }
};

