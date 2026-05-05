import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">suddenly</h2>
            <p className="footer-tagline">Elevating lifestyle through minimalistic and aesthetic designs.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-column">
              <h3 className="footer-heading">Shop</h3>
              <ul>
                <li><Link to="/shop?category=New Arrival">New Arrivals</Link></li>
                <li><Link to="/shop?category=Best Seller">Best Sellers</Link></li>
                <li><Link to="/sale">Special Offers</Link></li>
                <li><Link to="/shop">Gift Cards</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-heading">Support</h3>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/contact">Shipping & Returns</Link></li>
                <li><Link to="/shop">Size Guide</Link></li>
                <li><Link to="/contact">FAQ</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} suddenly. All rights reserved.</p>
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Pinterest">Pinterest</a>
            <a href="#" aria-label="Twitter">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
