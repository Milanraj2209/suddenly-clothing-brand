import React from 'react';
import './Featured.css';

const Featured = () => {
  const handleDiscoverClick = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="featured section-padding" id="about" aria-label="About suddenly">
      <div className="featured-container">
        <div className="featured-text">
          <h2 className="featured-title">Elegant Design, <br/> Expertly Crafted</h2>
          <p className="featured-desc">
            We believe in the power of simplicity. Our garments are designed with a minimalistic
            approach, focusing on premium materials, timeless silhouettes, and expert craftsmanship.
            Elevate your everyday aesthetic with suddenly.
          </p>
          <button
            className="btn-outline"
            aria-label="Discover our story"
            onClick={handleDiscoverClick}
          >
            Discover Our Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default Featured;
