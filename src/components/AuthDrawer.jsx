import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthDrawer.css';

const AuthDrawer = () => {
  const { user, login, logout, isAuthOpen, setIsAuthOpen } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setPhoneNumber('');
    setOtp('');
    setIsOtpSent(false);
    setError('');
  };

  const handleClose = () => {
    setIsAuthOpen(false);
    resetForm();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return setError('Please enter a valid phone number');
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOtpSent(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError('Please enter the OTP');

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user);
        handleClose();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthOpen) return null;

  return (
    <div className={`auth-drawer-overlay ${isAuthOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className="auth-drawer" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>&times;</button>
        
        <div className="auth-header">
          {user ? (
            <>
              <h2>My Account</h2>
              <p className="user-greeting">Welcome back, {user.name}</p>
            </>
          ) : (
            <>
              <h2>Sign In</h2>
              <p>Access your suddenly account using your mobile number.</p>
            </>
          )}
        </div>

        <div className="auth-content">
          {user ? (
            <div className="account-panel">
              <div className="user-info">
                <div className="info-item">
                  <label>Full Name</label>
                  <span>{user.name}</span>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <span>{user.phone || user.email}</span>
                </div>
              </div>
              
              <div className="account-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                  style={{ marginBottom: '10px' }}
                >
                  Go to My Dashboard
                </button>
                <button className="btn-secondary logout-btn" onClick={logout}>Sign Out</button>
              </div>
            </div>
          ) : (
            <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="auth-form">
              <div className="input-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)}
                  disabled={isOtpSent}
                  required 
                />
              </div>

              {isOtpSent && (
                <div className="input-group">
                  <label>Enter OTP</label>
                  <input 
                    type="text" 
                    placeholder="6-digit code" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)}
                    maxLength="6"
                    required 
                  />
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                    For testing, enter any code (e.g. 123456)
                  </p>
                </div>
              )}

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Processing...' : (isOtpSent ? 'Verify OTP' : 'Send OTP')}
              </button>

              {isOtpSent && (
                <div className="auth-toggle-link">
                  <p>
                    Didn't receive code? <button type="button" onClick={() => setIsOtpSent(false)}>Edit Number</button>
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDrawer;
