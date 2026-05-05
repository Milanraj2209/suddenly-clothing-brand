import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVariant } from '../context/VariantContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/assetRegistry';
import { formatPrice } from '../utils/priceUtils';
import './VariantSelector.css';

const VariantSelector = () => {
  const { isOpen, product, mode, closeVariantModal } = useVariant();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');

  if (!isOpen || !product) return null;

  const handleContinue = () => {
    if (!selectedSize) return;

    addToCart({ ...product, size: selectedSize });
    closeVariantModal();

    if (mode === 'buy') {
      navigate('/checkout');
    }
  };

  const sizes = ['S', 'L', 'XL', 'XXL', '3XL'];

  return (
    <div className="variant-overlay" onClick={closeVariantModal}>
      <div className="variant-modal" onClick={e => e.stopPropagation()}>
        <div className="variant-header">
          <h2>Select variant</h2>
          <button className="variant-close" onClick={closeVariantModal}>&times;</button>
        </div>

        <div className="variant-product-info">
          <div className="variant-img-wrapper">
            <img src={getImageUrl(product.image)} alt={product.name} />
          </div>
          <div className="variant-text-info">
            <h3>{product.name}</h3>
            <p className="variant-subtitle">Premium Quality Collection</p>
            <div className="variant-price-row">
              {product.originalPrice && (
                <span className="variant-original">{formatPrice(product.originalPrice).replace('₹', '')}</span>
              )}
              <span className="variant-current">{formatPrice(product.price)}</span>
            </div>
          </div>
        </div>

        <div className="variant-size-section">
          <div className="variant-size-grid">
            {sizes.map(size => (
              <button
                key={size}
                className={`variant-size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button 
          className={`variant-continue-btn ${selectedSize ? 'active' : ''}`}
          onClick={handleContinue}
          disabled={!selectedSize}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default VariantSelector;
