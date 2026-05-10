import api from './api';

export const garageService = {
  async getCars() {
    const { data } = await api.get('/garage/cars');
    return data;
  },

  async unlockCar(carId: string) {
    const { data } = await api.post('/garage/unlock', { car_id: carId });
    return data;
  },

  async upgradeCar(carId: string, stat: string) {
    const { data } = await api.post('/garage/upgrade', { car_id: carId, stat });
    return data;
  },

  async setCarColor(carId: string, color: string) {
    const { data } = await api.post('/garage/set-color', { car_id: carId, color });
    return data;
  },

  async setActiveCar(carId: string) {
    const { data } = await api.post(`/garage/set-active?car_id=${carId}`);
    return data;
  },
};
