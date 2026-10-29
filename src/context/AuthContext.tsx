import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<void>;
  loginAsWorker: (workerId: string, workerName: string, mobile?: string) => void;
  logout: () => Promise<void>;
  switchRole: (role: 'admin' | 'manager' | 'worker', workerInfo?: { id: string; name: string }) => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_ADMIN: User = {
  id: 'usr_proprietor',
  name: 'Kalindra Kumar Singh',
  username: 'kalindra',
  email: 'kalindra@kksinfraworks.com',
  role: 'admin',
  mobile: '9835000000',
  lastLogin: new Date().toISOString(),
};

const DEFAULT_MANAGER: User = {
  id: 'usr_manager',
  name: 'Authorized Site Manager',
  username: 'sitemanager',
  email: 'manager@kksinfraworks.com',
  role: 'manager',
  mobile: '9835100099',
  siteId: 'SITE-01',
  lastLogin: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kks_local_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ADMIN;
      }
    }
    return DEFAULT_ADMIN;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kks_local_user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (usernameOrEmail: string, _password?: string) => {
    setIsLoading(true);
    try {
      const lower = usernameOrEmail.toLowerCase();
      if (lower.includes('admin') || lower.includes('kalindra') || lower.includes('proprietor')) {
        setUser(DEFAULT_ADMIN);
      } else {
        setUser(DEFAULT_MANAGER);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsWorker = (workerId: string, workerName: string, mobile?: string) => {
    const workerUser: User = {
      id: `usr_${workerId}`,
      name: workerName,
      username: workerId.toLowerCase(),
      role: 'worker',
      workerId: workerId,
      mobile: mobile || '',
      lastLogin: new Date().toISOString(),
    };
    setUser(workerUser);
  };

  const switchRole = (role: 'admin' | 'manager' | 'worker', workerInfo?: { id: string; name: string }) => {
    if (role === 'admin') {
      setUser(DEFAULT_ADMIN);
    } else if (role === 'manager') {
      setUser(DEFAULT_MANAGER);
    } else if (role === 'worker' && workerInfo) {
      loginAsWorker(workerInfo.id, workerInfo.name);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('kks_local_user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    // offline no-op
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: 'local_offline_token',
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isWorker: user?.role === 'worker',
        isLoading,
        login,
        loginAsWorker,
        logout,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
