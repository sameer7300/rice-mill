import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer' | 'supplier';
  phone?: string;
  preferredLang: string;
  customer?: { id: string; businessName: string };
  supplier?: { id: string; businessName: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDirect: (token: string, userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  isSupplier: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requiresTwoFactor) {
      const err: any = new Error('2FA required');
      err.code = 'REQUIRES_2FA';
      err.tempToken = data.tempToken;
      throw err;
    }
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const loginDirect = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, loginDirect, logout,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff' || user?.role === 'admin',
      isCustomer: user?.role === 'customer',
      isSupplier: user?.role === 'supplier'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
