import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/assetRegistry';
import { formatPrice } from '../utils/priceUtils';
import './WishlistDrawer.css';

const WishlistDrawer = () => {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <div className={`wishlist-drawer-overlay ${isWishlistOpen ? 'open' : ''}`} onClick={() => setIsWishlistOpen(false)}>
      <div className="wishlist-drawer" onClick={e => e.stopPropagation()}>
        <div className="wishlist-header">
          <h2>Your Wishlist ({wishlistItems.length})</h2>
          <button className="close-btn" onClick={() => setIsWishlistOpen(false)}>&times;</button>
        </div>

        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <p>Your wishlist is empty</p>
              <button className="btn-primary" onClick={() => setIsWishlistOpen(false)}>Continue Shopping</button>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlistItems.map(item => (
                <div key={item.id} className="wishlist-item">
                  <div className="wishlist-item-img">
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  </div>
                  <div className="wishlist-item-info">
                    <h4>{item.name}</h4>
                    <p className="item-price">{formatPrice(item.price)}</p>
                    <div className="wishlist-item-actions">
                      <button 
                        className="btn-secondary move-to-cart-btn"
                        onClick={() => handleMoveToCart(item)}
                      >
                        Move to Cart
                      </button>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label="Remove"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
