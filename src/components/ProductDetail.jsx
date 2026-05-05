import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../utils/assetRegistry';
import { calculateDiscount, formatPrice } from '../utils/priceUtils';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.id.toString() === id);
        setProduct(found);
        if (found && found.colors && found.colors.length > 0) {
          setSelectedColor(found.colors[0]);
        }
        setLoading(false);
      });
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="detail-loading">Loading Collection...</div>;
  if (!product) return <div className="detail-error">Product Not Found. <Link to="/">Return Home</Link></div>;

  const handleBuyNow = () => {
    addToCart({ ...product, size: selectedSize, quantity });
    navigate('/checkout');
  };

  const handleQuantity = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const images = product.images || [product.image];

  return (
    <div className="product-detail section-padding">
      <div className="detail-container">
        <div className="detail-image-section">
          <div className="detail-main-image">
            <img src={getImageUrl(images[activeImage])} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={getImageUrl(img)} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="detail-info">
          <div className="detail-path">
            <Link to="/">Home</Link> / <span>{product.category}</span>
          </div>

          <div className="product-badges">
            {product.inventory <= 5 && product.inventory > 0 && (
              <span className="badge-v2 trending-badge">Limited Stock</span>
            )}
            {product.isNew && (
              <span className="badge-v2 new-arrival-badge">New Arrival</span>
            )}
            {calculateDiscount(product.originalPrice, product.price) && (
              <span className="badge-v2 best-seller-badge" style={{ background: '#000', color: '#fff', border: 'none' }}>
                -{calculateDiscount(product.originalPrice, product.price)}%
              </span>
            )}
          </div>
          
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="price-section">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="original-price">{formatPrice(product.originalPrice)}</span>
                <span className="discount-tag">
                  {calculateDiscount(product.originalPrice, product.price)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="color-selector">
            <h3>Color: <span>{selectedColor}</span></h3>
            <div className="color-options">
              {(product.colors && product.colors.length > 0 ? product.colors : ['Black', 'White', 'Beige']).map(color => (
                <button 
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.toLowerCase() }}
                  aria-label={`Select ${color}`}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <div className="size-selector">
            <div className="size-selector-header">
              <h3>Size: <span>{selectedSize}</span></h3>
              <button
                className="size-guide-link"
                onClick={() => setSizeChartOpen(true)}
              >
                Size Guide
              </button>
            </div>
            <div className="size-options">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="purchase-actions">
            <div className="quantity-selector">
              <button onClick={() => handleQuantity(-1)} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantity(1)} aria-label="Increase quantity">+</button>
            </div>
            
            <button 
              className="btn-primary add-to-bag-btn" 
              onClick={() => addToCart({ ...product, size: selectedSize, quantity })}
              disabled={product.inventory <= 0}
            >
              {product.inventory <= 0 ? 'Out of Stock' : 'ADD TO BAG'}
            </button>
          </div>

          {product.inventory > 0 && product.inventory <= 5 && (
            <div className="scarcity-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Only {product.inventory} left in stock - order soon!</span>
            </div>
          )}

          <div className="policy-section">
            <div className="policy-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 10l7 7 7-7"/>
              </svg>
              <span>Free Shipping</span>
            </div>
            <div className="policy-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <span>Easy Returns</span>
            </div>
          </div>
          
          <div className="detail-description">
            <p>Elevate your wardrobe with this expertly crafted piece from the suddenly collection. Designed for a minimalist aesthetic and maximum comfort, featuring premium materials and a tailored fit.</p>
          </div>

          {sizeChartOpen && <SizeChart onClose={() => setSizeChartOpen(false)} />}
          
          <div className="secondary-actions">
            <button 
              className="btn-outline buy-btn" 
              onClick={handleBuyNow}
              disabled={product.inventory <= 0}
            >
              Buy Now
            </button>
            <button 
              className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
};

const SizeChart = ({ onClose }) => {
  const [unit, setUnit] = useState('cm');

  const data = {
    cm: [
      { size: 'XS', chest: '86-91', waist: '71-76', hips: '86-91', length: '68' },
      { size: 'S', chest: '91-96', waist: '76-81', hips: '91-96', length: '70' },
      { size: 'M', chest: '96-101', waist: '81-86', hips: '96-101', length: '72' },
      { size: 'L', chest: '101-106', waist: '86-91', hips: '101-106', length: '74' },
      { size: 'XL', chest: '106-111', waist: '91-96', hips: '106-111', length: '76' },
    ],
    inches: [
      { size: 'XS', chest: '34-36', waist: '28-30', hips: '34-36', length: '26.8' },
      { size: 'S', chest: '36-38', waist: '30-32', hips: '36-38', length: '27.5' },
      { size: 'M', chest: '38-40', waist: '32-34', hips: '38-40', length: '28.3' },
      { size: 'L', chest: '40-42', waist: '34-36', hips: '40-42', length: '29.1' },
      { size: 'XL', chest: '42-44', waist: '36-38', hips: '42-44', length: '29.9' },
    ]
  };

  return (
    <div className="size-chart-overlay" onClick={onClose}>
      <div className="size-chart-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close size guide">&times;</button>
        
        <div className="size-chart-header">
          <h2>Size Guide</h2>
          <p>Find your perfect fit from the suddenly collection.</p>
        </div>

        <div className="unit-toggle">
          <button 
            className={unit === 'cm' ? 'active' : ''} 
            onClick={() => setUnit('cm')}
          >
            Metric (cm)
          </button>
          <button 
            className={unit === 'inches' ? 'active' : ''} 
            onClick={() => setUnit('inches')}
          >
            Imperial (in)
          </button>
        </div>

        <div className="size-chart-content">
          <div className="size-chart-visual">
            <img src="/size_guide_girl.png" alt="How to measure guide" />
          </div>
          <div className="size-table-container">
            <table className="size-table-excel">
              <thead>
                <tr>
                  <th>SIZE</th>
                  <th>CHEST (IN)</th>
                  <th>WAIST (IN)</th>
                  <th>HIPS (IN)</th>
                  <th>LENGTH (IN)</th>
                </tr>
              </thead>
              <tbody>
                {data[unit === 'cm' ? 'cm' : 'inches'].map((row) => (
                  <tr key={row.size}>
                    <td className="size-label">{row.size}</td>
                    <td>{row.chest}</td>
                    <td>{row.waist}</td>
                    <td>{row.hips}</td>
                    <td>{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="measurement-tips">
          <h4>How to Measure</h4>
          <ul>
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
            <li><strong>Waist:</strong> Measure around the narrowest part (typically where your body bends side to side), keeping the tape horizontal.</li>
            <li><strong>Hips:</strong> Measure around the fullest part of your hips, keeping the tape horizontal.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, setIsAuthOpen } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = () => {
    fetch(`/api/reviews/${productId}`)
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    
    setSubmitting(true);
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        user: user.name,
        rating,
        comment
      })
    })
    .then(res => res.json())
    .then(() => {
      setSubmitting(false);
      setComment('');
      setRating(5);
      fetchReviews();
    });
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Client Reviews</h2>
        <div className="review-stats">
          {reviews.length > 0 && (
            <span>{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0</span>
          )}
        </div>
      </div>

      <div className="review-list">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-meta">
                <span className="review-user">{review.user}</span>
                <span className="review-date">{review.date}</span>
              </div>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to share your experience.</p>
        )}
      </div>

      <div className="add-review-form">
        <h3>Submit a Review</h3>
        {user ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Rating</label>
              <div className="star-input">
                {[1, 2, 3, 4, 5].map(s => (
                  <button 
                    key={s} 
                    type="button" 
                    className={`star-btn ${rating >= s ? 'active' : ''}`}
                    onClick={() => setRating(s)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Your Feedback</label>
              <textarea 
                placeholder="How was the quality and fit?" 
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="auth-notice">
            <p>Please <button onClick={() => setIsAuthOpen(true)}>sign in</button> to leave a review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
