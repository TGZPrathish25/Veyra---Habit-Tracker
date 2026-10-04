/** socket.io-client factory with token auth and reconnect. */
import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = useAuthStore.getState().token || '';
    socket = io(env.VITE_SOCKET_URL, {
      autoConnect: true,
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}
