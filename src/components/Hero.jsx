import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import heroImage from '../assets/hero_image.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero" id="home" aria-label="Hero banner">
      <div className="hero-content animate-fade-in">
        <h2 className="hero-subtitle">The Aesthetic Collection</h2>
        <h1 className="hero-title">New Arrivals</h1>
        <p className="hero-text">Discover minimalistic, elegant designs tailored for the modern aesthetic. Soft neutrals, crafted expertly.</p>
        <button
          className="btn-primary"
          aria-label="Shop new arrivals"
          onClick={() => navigate('/shop')}
        >
          Shop Now
        </button>
      </div>
      <div className="hero-image-container animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <img src={heroImage} alt="Fashion Model styling neutral clothes" className="hero-image" />
      </div>
    </section>
  );
};

export default Hero;
