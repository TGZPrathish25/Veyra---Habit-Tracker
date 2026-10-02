/** Hook to subscribe to a Socket.IO event. */
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export function useSocketEvent<T>(event: string, handler: (data: T) => void): void {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => { socket.off(event, handler); };
  }, [event, handler]);
}
