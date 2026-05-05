import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import Featured from './Featured';
import Categories from './Categories';
import NewArrivals from './NewArrivals';
import SaleBanner from './SaleBanner';

const LandingPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.homePage && data.homePage.sections) {
          setSections(data.homePage.sections);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  const componentMap = {
    hero: <Hero key="hero" />,
    sale: <SaleBanner key="sale" />,
    featured: <Featured key="featured" />,
    categories: <Categories key="categories" />,
    newArrivals: <NewArrivals key="newArrivals" />
  };

  return (
    <>
      {sections.length > 0 ? (
        sections
          .filter(s => s.enabled)
          .map(s => componentMap[s.id])
      ) : (
        <>
          <Hero />
          <SaleBanner />
          <Featured />
          <Categories />
          <NewArrivals />
        </>
      )}
    </>
  );
};

export default LandingPage;
