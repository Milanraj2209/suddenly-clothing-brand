import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';
import { getImageUrl } from '../utils/assetRegistry';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <section className="categories section-padding" aria-label="Shop by category">
      <div className="categories-grid">
        {categories.map((cat, index) => {
          const isComingSoon = cat.title === 'Curated Gifts';

          if (isComingSoon) {
            return (
              <div
                key={index}
                className="category-card category-card--coming-soon"
                aria-label="Curated Gifts — Coming Soon"
              >
                <div className="category-image-wrapper">
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.title}
                    className="category-image"
                  />
                  <div className="category-overlay category-overlay--coming-soon">
                    <span className="category-label">{cat.label}</span>
                    <h3 className="category-title">{cat.title}</h3>
                    <div className="coming-soon-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={index}
              to="/shop"
              className="category-card"
              aria-label={`Shop ${cat.title}`}
            >
              <div className="category-image-wrapper">
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.title}
                  className="category-image"
                />
                <div className="category-overlay">
                  <span className="category-label">{cat.label}</span>
                  <h3 className="category-title">{cat.title}</h3>
                  <span className="category-btn" role="button" aria-label={`Shop ${cat.title}`}>Shop Now</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;

