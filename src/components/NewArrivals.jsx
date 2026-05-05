import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVariant } from '../context/VariantContext';
import { getImageUrl } from '../utils/assetRegistry';
import { calculateDiscount, formatPrice } from '../utils/priceUtils';
import './NewArrivals.css';

const NewArrivals = () => {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sliderRef = React.useRef(null);
  const { addToCart } = useCart();
  const { openVariantModal } = useVariant();
  const navigate = useNavigate();

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    fetch('/api/products?category=New Arrival')
      .then(res => res.json())
      .then(data => {
        setArrivals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching new arrivals:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="section-padding" style={{textAlign: 'center'}}>Fetching new styles...</div>;

  return (
    <section className="new-arrivals section-padding" aria-label="New arrivals">
      <div className="section-header">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Freshly arrived pieces for your aesthetic wardrobe.</p>
          </div>
          <button
            className="view-all-btn"
            onClick={() => navigate('/shop?category=New Arrival')}
            aria-label="View all new arrivals"
          >
            View All →
          </button>
        </div>
      </div>
      <div 
        className="arrivals-slider-wrapper"
        ref={sliderRef}
        onScroll={handleScroll}
      >
        <div className="arrivals-slider-track">
          {arrivals.map((item) => (
            <div key={item.id} className="arrival-card">
              <Link to={`/product/${item.id}`} className="arrival-link" aria-label={`View ${item.name}`}>
                <div className="arrival-image-wrapper">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="arrival-image"
                  />
                  <span className="arrival-badge-v3">NEW ARRIVAL</span>
                </div>
              </Link>
              <Link to={`/product/${item.id}`} className="arrival-info-link">
                <div className="arrival-details">
                  <h3 className="arrival-name">{item.name}</h3>
                  <div className="price-container">
                    <div className="price-row">
                      <span className="current-price">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="original-price">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="slider-scrollbar">
        <div 
          className="slider-scrollbar-thumb" 
          style={{ left: `${scrollProgress}%` }}
        ></div>
      </div>
    </section>
  );
};

export default NewArrivals;
