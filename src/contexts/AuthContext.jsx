import React, { createContext, useContext, useEffect, useState } from 'react';
const STORAGE_KEY = 'dev_user';
const AuthCtx = createContext({ user: null, // { username, role }
  loading: false, login: async (_u) => {}, logout: () => {} });
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { 
    try { 
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Ensure role is properly set
      if (parsed && !parsed.role) {
        parsed.role = parsed.username?.toLowerCase() === 'admin' ? 'admin' : 'employee';
      }
      return parsed;
    } catch (e) { 
      return null; 
    } 
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { 
    try { 
      if (user) {
        // Ensure role is always set
        const userWithRole = { ...user, role: user.role || (user.username?.toLowerCase() === 'admin' ? 'admin' : 'employee') };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithRole));
        if (userWithRole.role !== user.role) {
          setUser(userWithRole);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY); 
      }
    } catch (e) {
      console.error('AuthProvider error:', e);
    } 
  }, [user]);
  
  async function login({ username, password }) { 
    setLoading(true);
    try {
      // Call the backend API for authentication
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials');
        }
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      
      setUser(data.user);
      return data.user;
    } catch (e) {
      console.error('Login error:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }
  
  function logout() { 
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEY);
    setUser(null); 
  }
  
  const value = { user, loading, login, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export function useAuth() { return useContext(AuthCtx); }