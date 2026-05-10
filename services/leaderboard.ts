import api from './api';

export const leaderboardService = {
  async getLeaderboard() {
    const { data } = await api.get('/leaderboard');
    return data;
  },

  async submitScore(distance: number, coins: number, mode: string) {
    const { data } = await api.post('/leaderboard/submit', { distance, coins, mode });
    return data;
  },
};
