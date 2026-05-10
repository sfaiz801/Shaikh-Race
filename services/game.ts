import api from './api';

export const gameService = {
  async updateCoins(amount: number) {
    const { data } = await api.post('/user/update-coins', { amount });
    return data;
  },

  async updateXP(amount: number) {
    const { data } = await api.post('/user/update-xp', { amount });
    return data;
  },

  async claimDailyReward() {
    const { data } = await api.get('/user/daily-reward');
    return data;
  },
};
