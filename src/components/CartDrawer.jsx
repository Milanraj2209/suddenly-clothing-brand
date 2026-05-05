import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';
import { getImageUrl } from '../utils/assetRegistry';

const CartDrawer = () => {
  const { cart, removeFromCart, updateQuantity, cartTotalFormatted, isCartOpen, setIsCartOpen } = useCart();


  if (!isCartOpen) return null;

  return (
    <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Bag</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your bag is empty.</p>
              <Link to="/" onClick={() => setIsCartOpen(false)} className="shop-link">Start Shopping</Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-img">
                  <img src={getImageUrl(item.image)} alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>&times;</button>
                  </div>
                  <p className="item-price">{item.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>{cartTotalFormatted}</span>
            </div>
            <p className="tax-info">Shipping and taxes calculated at checkout.</p>
            <Link 
              to="/checkout" 
              className="btn-primary checkout-btn" 
              onClick={() => setIsCartOpen(false)}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
