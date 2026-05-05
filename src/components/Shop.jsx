import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useVariant } from '../context/VariantContext';
import { getImageUrl } from '../utils/assetRegistry';
import { calculateDiscount, formatPrice } from '../utils/priceUtils';
import './Shop.css';

const CATEGORIES = ['All', 'Best Seller', 'New Arrival'];
const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [sortOrder, setSortOrder] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(25000); // Max 25k
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openVariantModal } = useVariant();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let result = [...products];

    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price Filter
    result = result.filter(p => {
      const price = parseFloat(p.price.replace('₹', '').replace(/,/g, ''));
      return price <= priceRange;
    });

    // Sorting
    if (sortOrder === 'low-high') {
      result.sort((a, b) =>
        parseFloat(a.price.replace('₹', '').replace(/,/g, '')) -
        parseFloat(b.price.replace('₹', '').replace(/,/g, ''))
      );
    } else if (sortOrder === 'high-low') {
      result.sort((a, b) =>
        parseFloat(b.price.replace('₹', '').replace(/,/g, '')) -
        parseFloat(a.price.replace('₹', '').replace(/,/g, ''))
      );
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    setFiltered(result);
  }, [activeCategory, sortOrder, searchQuery, priceRange, products]);

  return (
    <div className="shop-page section-padding">
      {/* Header */}
      <div className="shop-header">
        <h1>The Collection</h1>
        <p>{filtered.length} pieces</p>
      </div>

      {/* Controls */}
      <div className="shop-controls">
        <div className="controls-left">
          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/>
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="controls-right">
          <select
            className="sort-select"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="default">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Drawer */}
      <div className={`filter-drawer ${showFilters ? 'open' : ''}`}>
        <div className="filter-group">
          <h4>Category</h4>
          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Price Range</h4>
          <div className="price-slider-container">
            <input 
              type="range" 
              min="0" 
              max="25000" 
              step="1000"
              value={priceRange}
              onChange={e => setPriceRange(parseInt(e.target.value))}
              className="price-slider"
            />
            <div className="price-labels">
              <span>Under ₹{priceRange.toLocaleString()}</span>
              <span>Max ₹25,000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="shop-loading">Loading collection...</div>
      ) : filtered.length === 0 ? (
        <div className="shop-empty">
          <p>No pieces found for "{searchQuery}"</p>
          <button className="btn-primary" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Clear Filters</button>
        </div>
      ) : (
        <div className="shop-grid">
          {filtered.map(product => (
            <div key={product.id} className="shop-card">
              <Link to={`/product/${product.id}`} className="shop-card-img-link">
                <div className="shop-card-img">
                  <img src={getImageUrl(product.image)} alt={product.name} />
                  {product.tag && <span className="shop-tag">{product.tag}</span>}
                  {product.isTrending && <span className="trending-badge badge-v2">🔥 Trending</span>}
                  {product.category === 'Best Seller' && <span className="best-seller-badge badge-v2">🏆 Best Seller</span>}
                  {product.category === 'New Arrival' && <span className="new-arrival-badge badge-v2">✨ New Arrival</span>}
                  <button 
                    className={`wishlist-icon-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleWishlist(product);
                    }}
                    aria-label="Toggle Wishlist"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  {product.inventory <= 0 && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                  )}
                  <div className="shop-card-overlay">
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openVariantModal(product, 'add');
                      }}
                    >
                      Add to Bag
                    </button>
                    <button
                      className="btn-primary buy-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openVariantModal(product, 'buy');
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </Link>
              <Link to={`/product/${product.id}`} className="shop-card-info-link">
                <div className="shop-card-info">
                  <span className="shop-cat-label">{product.category}</span>
                  <h3>{product.name}</h3>
                  <div className="price-container">
                    <div className="price-row">
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
                    {product.originalPrice && (
                      <div className="promise-fee">
                        +₹86 Protect Promise Fee <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
