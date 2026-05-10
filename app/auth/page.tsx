// ============================================================
// SHAIKH RACE — Auth Page (Login/Register)
// ============================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './auth.module.scss';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      router.push('/menu');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <h1 className={styles.logo}>SHAIKH RACE</h1>
        
        <div className={styles.tabs}>
          <button 
            className={isLogin ? styles.activeTab : ''} 
            onClick={() => setIsLogin(true)}
          >
            LOGIN
          </button>
          <button 
            className={!isLogin ? styles.activeTab : ''} 
            onClick={() => setIsLogin(false)}
          >
            REGISTER
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="USERNAME"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="EMAIL"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="PASSWORD"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          {error && <p className={styles.error}>{error}</p>}
          
          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'LOG IN' : 'SIGN UP'}
          </button>
        </form>
      </div>
    </div>
  );
}
