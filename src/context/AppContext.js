'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [walletBalance, setWalletBalance] = useState(50000);
  const [sessionId, setSessionId] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Generate session ID
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check authentication
    checkAuth();
  }, []);

  

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setUser(data.user);
        fetchWalletBalance(data.user.id);
      } else {
        setUser(null);
        // Redirect to login if trying to access protected route
        const publicRoutes = ['/login', '/register', '/'];
        if (!publicRoutes.includes(pathname) && !pathname.startsWith('/_next')) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await fetch(`/api/wallet${userId ? `?userId=${userId}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        await fetchWalletBalance(data.user.id);
        router.push('/');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        await fetchWalletBalance(data.user.id);
        router.push('/');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setWalletBalance(0);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <AppContext.Provider value={{
      walletBalance,
      setWalletBalance,
      sessionId,
      darkMode,
      toggleDarkMode,
      fetchWalletBalance,
      user,
      loading,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
