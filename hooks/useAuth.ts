import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    await fetchProfile();
  };

  const register = async (username: string, email: string, password: string) => {
    await authService.register(username, email, password);
    await fetchProfile();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { user, isLoading, login, register, logout };
}
