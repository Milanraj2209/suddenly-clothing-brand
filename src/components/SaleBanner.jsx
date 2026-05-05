import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SaleBanner.css';
import saleImg from '../assets/category_sale.png';

const SaleBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="sale-banner" aria-label="End of season sale">
      <div className="sale-container">
        <div className="sale-content animate-fade-in">
          <span className="sale-label">Limited Time Offer</span>
          <h2 className="sale-title">End of Season Sale</h2>
          <p className="sale-text">Up to 50% Off on selected aesthetic pieces. Redefine your style for less.</p>
          <button
            className="btn-primary"
            aria-label="Shop the end of season sale"
            onClick={() => navigate('/sale')}
          >
            Shop the Sale
          </button>
        </div>
        <div className="sale-image-container">
          <img src={saleImg} alt="Sale Promotion — up to 50% off" className="sale-image" />
        </div>
      </div>
    </section>
  );
};

export default SaleBanner;
