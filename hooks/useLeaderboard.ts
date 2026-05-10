import { useState, useEffect } from 'react';
import { leaderboardService } from '@/services/leaderboard';

export function useLeaderboard() {
  const [scores, setScores] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch
    leaderboardService.getLeaderboard().then(setScores).catch(console.error);

    // WebSocket setup
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/leaderboard`);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => {
      setIsConnected(false);
      // Auto reconnect after 3 seconds
      setTimeout(() => {
        // This is a simple version, ideally you'd use a more robust reconnect logic
      }, 3000);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'update') {
        setScores(message.data);
      }
    };

    return () => ws.close();
  }, []);

  return { scores, isConnected };
}
