import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

// Password moved to backend for security

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('aura_admin_token', data.token);
        setLoading(false);
        onLogin();
      } else {
        setError(data.message || 'Incorrect password. Please try again.');
        setLoading(false);
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please check if the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">suddenly</div>
        <h2>Admin Access</h2>
        <p className="login-subtitle">Enter your credentials to manage the store.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              autoFocus
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>
        <button className="back-link" onClick={() => navigate('/')}>← Back to Store</button>
      </div>
    </div>
  );
};

export default AdminLogin;
