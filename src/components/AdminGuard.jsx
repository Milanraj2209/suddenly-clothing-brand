import React, { useState } from 'react';
import Admin from './Admin';
import AdminLogin from './AdminLogin';

const AdminGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('aura_admin_token') !== null
  );

  const handleLogout = () => {
    sessionStorage.removeItem('aura_admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Admin onLogout={handleLogout} />;
};

export default AdminGuard;
