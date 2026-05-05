import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('aura_user', JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthOpen, setIsAuthOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
