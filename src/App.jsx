import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ProductDetail from './components/ProductDetail';
import Shop from './components/Shop';
import AdminGuard from './components/AdminGuard';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthDrawer from './components/AuthDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import UserProfile from './components/UserProfile';
import ComingSoon from './components/ComingSoon';
import SalePortal from './components/SalePortal';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { VariantProvider } from './context/VariantContext';
import VariantSelector from './components/VariantSelector';

function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setIsLocked(data.isLocked);
        setConfigLoading(false);
      })
      .catch(() => setConfigLoading(false));
  }, []);

  if (configLoading) return null;

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isLocked && !isAdminRoute) {
    return <ComingSoon />;
  }

  return (
    <AuthProvider>
      <WishlistProvider>
        <VariantProvider>
          <div className="app-container">
            {!isAdminRoute && <Navbar />}
            <CartDrawer />
            <WishlistDrawer />
            <AuthDrawer />
            <VariantSelector />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/sale" element={<SalePortal />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/admin" element={<AdminGuard />} />
              </Routes>
            </main>
            {!isAdminRoute && <Footer />}
          </div>
        </VariantProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
