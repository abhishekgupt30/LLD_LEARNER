import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const current = authService.getCurrentUser();
    if (current) setUser(current);
  }, []);

  const login = async (email: string, name?: string, password?: string) => {
    const loggedIn = await authService.login(email, name, password);
    setUser(loggedIn);
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('lld_mentor_token');
    setUser(null);
  };

  const updateTrack = (track: string) => {
    const updated = authService.updateTrack(track);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && localStorage.getItem('lld_mentor_token')),
        login,
        logout,
        updateTrack
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
