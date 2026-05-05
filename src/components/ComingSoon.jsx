import React from 'react';
import './ComingSoon.css';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <h1 className="coming-soon-logo">suddenly</h1>
        <div className="coming-soon-divider"></div>
        <h2 className="coming-soon-title">We are preparing something special.</h2>
        <p className="coming-soon-subtitle">Our storefront is currently closed for an exclusive update. We will be back shortly with our newest collection.</p>
        
        <div className="coming-soon-newsletter">
          <p>Join the list for early access.</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">→</button>
          </form>
        </div>
      </div>
      
      <div className="coming-soon-footer">
        © 2026 suddenly. All rights reserved.
      </div>
    </div>
  );
};

export default ComingSoon;
