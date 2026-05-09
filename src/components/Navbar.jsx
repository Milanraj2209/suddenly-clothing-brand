import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user, setIsAuthOpen } = useAuth();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">

          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">suddenly</Link>
          </div>

          {/* Desktop Menu */}
          <ul className="navbar-menu">
            <li><Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Home</Link></li>
            <li><Link to="/shop" className={location.pathname === '/shop' ? 'nav-active' : ''}>Shop</Link></li>
            <li><Link to="/sale" className={location.pathname === '/sale' ? 'nav-active sale-nav-link' : 'sale-nav-link'}>Sale</Link></li>
            <li><Link to="/contact" className={location.pathname === '/contact' ? 'nav-active' : ''}>Contact</Link></li>
          </ul>

          {/* Hamburger */}
          <div className="navbar-hamburger">
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

        </div>
      </nav>

      {/* Bottom Navigation Icons */}
      <div className="bottom-nav-icons">
        <Link
          to={user ? "/profile" : "#"}
          aria-label="Account"
          className="icon-btn auth-toggle"
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              setIsAuthOpen(true);
            }
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {user && <span className="user-dot"></span>}
        </Link>

        <button
          aria-label="Wishlist"
          className="icon-btn wishlist-toggle"
          onClick={() => setIsWishlistOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
        </button>

        <button
          aria-label="Cart"
          className="icon-btn cart-toggle"
          onClick={() => setIsCartOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        <button
          aria-label="Toggle Theme"
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/sale" className="mobile-sale-link">Sale</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li>
            <button 
              className="mobile-auth-btn" 
              onClick={() => { setIsAuthOpen(true); setMenuOpen(false); }}
            >
              {user ? `Account (${user.name})` : 'Login / Register'}
            </button>
          </li>
          <li className="mobile-admin-link"><Link to="/admin">Admin ↗</Link></li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
