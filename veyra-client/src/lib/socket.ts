/** socket.io-client factory with token auth and reconnect. */
import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(env.VITE_SOCKET_URL, {
      autoConnect: false,
      auth: { token: '' },
    });
  }
  return socket;
}
