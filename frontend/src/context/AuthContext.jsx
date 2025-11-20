import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  async function fetchProfile() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed profile');
      const data = await res.json();
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }

  function login(tokenValue, userValue) {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userValue);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}