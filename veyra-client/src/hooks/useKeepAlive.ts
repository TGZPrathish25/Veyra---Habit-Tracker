import { useEffect } from 'react';
import { env } from '@/config/env';

/**
 * Periodically pings backend /ping every 10 minutes to prevent
 * free-tier host (Render) from sleeping while the web app is open.
 */
export function useKeepAlive(): void {
  useEffect(() => {
    const pingBackend = () => {
      const pingUrl = `${env.VITE_API_URL.replace(/\/+$/, '')}/ping`;
      fetch(pingUrl, { method: 'GET', keepalive: true }).catch(() => {
        // Silently catch network drops without disrupting UI
      });
    };

    // Ping once on mount to warm up instance if cold
    pingBackend();

    // Repeat every 10 minutes (600,000 ms)
    const interval = setInterval(pingBackend, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
