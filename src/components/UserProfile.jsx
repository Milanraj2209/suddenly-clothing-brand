import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/assetRegistry';
import './UserProfile.css';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="profile-page section-padding">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-user-info">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.phone || user.email}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <button 
              className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              My Orders
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => navigate('/wishlist')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              My Wishlist
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Account Settings
            </button>
            <button className="profile-nav-item logout" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>
          </nav>
        </aside>

        <main className="profile-content">
          {activeTab === 'orders' && (
            <div className="orders-view">
              <h2 className="content-title">Order History</h2>
              
              {loading ? (
                <div className="profile-loading">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#eee" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn-primary">Start Shopping</Link>
                </div>
              ) : (
                <div className="order-history-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-history-card">
                      <div className="order-card-header">
                        <div className="order-main-info">
                          <span className="order-id">Order {order.id}</span>
                          <span className="order-date">{order.date}</span>
                        </div>
                        <span className={`order-status-tag ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="order-items-preview">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <img src={getImageUrl(item.image)} alt={item.name} />
                            <div className="item-info">
                              <h4>{item.name}</h4>
                              <p>Qty: {item.quantity} | Size: {item.size || 'M'}</p>
                            </div>
                            <span className="item-price">{item.price}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-card-footer">
                        <div className="total-label">Total Amount:</div>
                        <div className="total-value">{order.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view">
              <h2 className="content-title">Account Settings</h2>
              <form className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user.name} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" defaultValue={user.phone} />
                  </div>
                </div>
                <button type="button" className="btn-primary">Update Profile</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
