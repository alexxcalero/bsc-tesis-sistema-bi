'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, LoginCredentials, Usuario } from '@/lib/api';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (codigo: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('bi_token');
    if (storedToken) {
      setToken(storedToken);
      authApi
        .me()
        .then((usuario) => {
          setUser(usuario);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('bi_token', response.token);
    setToken(response.token);
    setUser(response.usuario);
    router.push('/module1/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('bi_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (codigo: string): boolean => {
    if (!user) return false;
    return user.rol.permisos.some((p) => p.codigo === codigo);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
