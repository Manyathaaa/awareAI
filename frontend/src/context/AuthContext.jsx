import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/index.js';

const AuthContext = createContext(null);

// Normalize user so _id is always a string
const normalize = (u) => u ? { ...u, _id: String(u._id || u.id) } : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, rehydrate user from stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then((res) => setUser(normalize(res.data)))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('token', res.data.token);
    const u = normalize(res.data.user);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('token', res.data.token);
    const u = normalize(res.data.user);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
