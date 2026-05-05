import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVariant } from '../context/VariantContext';
import './BestSellers.css';
import { getImageUrl } from '../utils/assetRegistry';
import { calculateDiscount, formatPrice } from '../utils/priceUtils';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { openVariantModal } = useVariant();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products?category=Best%20Seller')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching best sellers:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="section-padding" style={{textAlign: 'center'}}>Loading curated pieces...</div>;

  return (
    <section className="best-sellers section-padding" id="shop" aria-label="Best sellers">
      <div className="section-header">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Our most loved pieces, designed with care.</p>
          </div>
          <button
            className="view-all-btn"
            onClick={() => navigate('/shop?category=Best Seller')}
            aria-label="View all best sellers"
          >
            View All →
          </button>
        </div>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-link" aria-label={`View ${product.name}`}>
              <div className="product-image-container">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="product-image"
                />
                {product.isTrending && <span className="trending-badge badge-v2">🔥 Trending</span>}
                <span className="best-seller-badge badge-v2">🏆 Best Seller</span>
                <button
                  className="add-to-cart-btn"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={(e) => {
                    e.preventDefault();
                    openVariantModal(product, 'add');
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </Link>
            <Link to={`/product/${product.id}`} className="product-info-link">
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="price-container" style={{ alignItems: 'center' }}>
                  <div className="price-row" style={{ justifyContent: 'center' }}>
                    {product.originalPrice && calculateDiscount(product.originalPrice, product.price) && (
                      <span className="discount-percent">
                        ↓{calculateDiscount(product.originalPrice, product.price)}%
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="original-price">
                        {formatPrice(product.originalPrice).replace('₹', '')}
                      </span>
                    )}
                    <span className="current-price">{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
