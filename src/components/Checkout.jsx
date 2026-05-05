import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/assetRegistry';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, cartTotalFormatted, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [savedAddresses] = useState([
    {
      id: 1,
      name: 'Amit',
      address: 'Inayat apartment',
      area: 'Law gate',
      city: 'Jalandhar , Punjab 144411',
      phone: '8727859505'
    }
  ]);

  const handleApplyCoupon = () => {
    if (!promoCode) return;
    
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAppliedCoupon(data.coupon);
        // Calculate discount
        if (data.coupon.type === 'percentage') {
          const amount = (cartTotal * data.coupon.discount) / 100;
          setDiscount(amount);
        } else {
          setDiscount(data.coupon.discount);
        }
        alert(`Coupon "${data.coupon.code}" applied!`);
      } else {
        alert(data.message);
        setAppliedCoupon(null);
        setDiscount(0);
      }
    });
  };

  const finalTotal = cartTotal - discount;
  const finalTotalFormatted = `₹${finalTotal.toLocaleString('en-IN')}`;

  if (cart.length === 0) {
    return (
      <div className="checkout-empty section-padding">
        <h2>Your bag is currently empty.</h2>
        <Link to="/" className="btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const address = savedAddresses.find(a => a.id === selectedAddress);
    const orderData = {
      userId: user ? user.id : null,
      customer: address.name,
      customerDetails: {
        email: user ? user.email : 'guest@demo.com',
        address: `${address.address}, ${address.area}, ${address.city}`
      },
      items: cart,
      total: finalTotalFormatted,  
      status: 'Pending',
      discount: discount > 0 ? {
        code: appliedCoupon.code,
        amount: discount
      } : null
    };

    fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      clearCart();
      navigate(`/order-success/${data.orderId}`);
    })
    .catch(err => {
      setLoading(false);
      alert('Checkout failed. Please try again.');
    });
  };

  return (
    <div className="checkout-page section-padding">
      <div className="checkout-container">
        <div className="checkout-main">
          <h1 className="checkout-title">Buy Now Checkout</h1>
          
          <div className="shipping-section">
            <h2 className="section-subtitle">Shipping Address</h2>
            
            <div className="address-list">
              {savedAddresses.map(addr => (
                <div 
                  key={addr.id} 
                  className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(addr.id)}
                >
                  <div className="address-card-header">
                    <strong>{addr.name}</strong>
                    <div className="address-card-actions">
                      {selectedAddress === addr.id && (
                        <span className="selected-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </span>
                      )}
                      <button className="delete-addr-btn" aria-label="Delete address">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <p>{addr.address}</p>
                  <p>{addr.area}</p>
                  <p>{addr.city}</p>
                  <p>{addr.phone}</p>
                </div>
              ))}
            </div>

            <button className="add-new-address">
              <span>+ Add New Address</span>
            </button>
          </div>
        </div>

        <aside className="checkout-sidebar">
          <div className="order-summary-card">
            <h2 className="sidebar-title">Order Summary</h2>
            
            <div className="review-order-section">
              <h3 className="review-title">Review Order</h3>
              <div className="summary-products">
                {cart.map(item => (
                  <div key={item.id} className="summary-prod-row">
                    <img src={getImageUrl(item.image)} alt={item.name} />
                    <div className="summary-prod-info">
                      <span className="summary-prod-name">{item.name}</span>
                      <span className="summary-prod-meta">Qty: {item.quantity} | Size: {item.size || 'M'}</span>
                    </div>
                    <span className="summary-prod-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="promo-section">
              <h3 className="promo-label">Promo Code</h3>
              <button className="view-coupons">View All Coupons</button>
              <div className="promo-input-group">
                <input 
                  type="text" 
                  placeholder="Type code..." 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button className="apply-btn" onClick={handleApplyCoupon}>Apply</button>
              </div>
            </div>

            <div className="cost-breakdown">
              <div className="cost-row">
                <span>Subtotal</span>
                <span>{cartTotalFormatted}</span>
              </div>
              {discount > 0 && (
                <div className="cost-row discount">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="cost-row">
                <span>Shipping</span>
                <span className="free-text">Free</span>
              </div>
              <div className="cost-total">
                <span>Total</span>
                <span>{finalTotalFormatted}</span>
              </div>
            </div>

            <button 
              className="btn-primary place-order-btn" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
