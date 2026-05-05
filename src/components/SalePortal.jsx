import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVariant } from '../context/VariantContext';
import { getImageUrl } from '../utils/assetRegistry';
import { calculateDiscount, formatPrice } from '../utils/priceUtils';
import './SalePortal.css';

const SalePortal = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { openVariantModal } = useVariant();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Filter only products that have an originalPrice (indicating a sale)
        const saleItems = data.filter(p => p.originalPrice);
        setProducts(saleItems);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sale items:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="sale-loading">
      <div className="loader-text">Curating Exclusive Offers...</div>
    </div>
  );

  return (
    <div className="sale-portal">
      <header className="sale-header">
        <div className="sale-banner-content">
          <span className="sale-tag">Limited Time</span>
          <h1 className="sale-title">End of Season Sale</h1>
          <p className="sale-subtitle">Timeless pieces, now within reach. Up to 40% off our curated collection.</p>
        </div>
      </header>

      <div className="sale-container section-padding">
        {products.length === 0 ? (
          <div className="no-sale-items">
            <p>Our current sale has concluded. Please check back soon for our next exclusive event.</p>
            <Link to="/shop" className="btn-primary">Explore New Arrivals</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card sale-item">
                <Link to={`/product/${product.id}`} className="product-image-link">
                  <div className="product-image-container">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="sale-badge">
                      SALE -{calculateDiscount(product.originalPrice, product.price)}%
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        openVariantModal(product, 'add');
                      }}
                    >
                      Quick Add
                    </button>
                  </div>
                </Link>
                <Link to={`/product/${product.id}`} className="product-info-link">
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="price-container">
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                      <span className="current-price sale-price">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalePortal;
