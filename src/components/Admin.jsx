import React, { useState, useEffect } from 'react';
import { getAllImages, imageMap, getImageUrl } from '../utils/assetRegistry';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Admin.css';
import './MediaLibrary.css';

const Admin = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [homePageConfig, setHomePageConfig] = useState({ sections: [], enableCountdown: false });
  const [isStoreLocked, setIsStoreLocked] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [newOrder, setNewOrder] = useState({ items: '', total: '', status: 'Pending', customer: '' });
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    originalPrice: '', 
    category: 'New Arrival', 
    image: 'product_1.png', 
    imagesString: '', 
    colorsString: '', 
    tag: '', 
    isTrending: false, 
    inventory: 5 
  });

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setIsStoreLocked(data.isLocked);
        if (data.homePage) setHomePageConfig(data.homePage);
      });
    
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/api/orders', {
      headers: { 'x-admin-token': sessionStorage.getItem('aura_admin_token') }
    })
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': sessionStorage.getItem('aura_admin_token')
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(() => fetchOrders());
  };

  const toggleImageInForm = (imageKey) => {
    let currentImages = newProduct.imagesString.split(',').map(s => s.trim()).filter(s => s !== '');
    if (currentImages.includes(imageKey)) {
      currentImages = currentImages.filter(s => s !== imageKey);
    } else {
      currentImages.push(imageKey);
    }
    setNewProduct({ ...newProduct, imagesString: currentImages.join(', ') });
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-token': sessionStorage.getItem('aura_admin_token')
  });

  const authenticatedFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    });
    if (res.status === 401) {
      alert('Session expired. Please login again.');
      onLogout();
      return null;
    }
    return res;
  };

  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordRes = await authenticatedFetch('/api/orders');
      const prodRes = await fetch('/api/products'); 
      const uploadsRes = await fetch('/api/uploads');
      const configRes = await fetch('/api/config');
      const catRes = await fetch('/api/categories');
      const coupRes = await authenticatedFetch('/api/admin/coupons');
      
      if (configRes.ok) {
        const configData = await configRes.json();
        setIsStoreLocked(configData.isLocked);
        if (configData.homePage) setHomePageConfig(configData.homePage);
      }
      
      if (ordRes) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }
      
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      if (coupRes && coupRes.ok) {
        const coupData = await coupRes.json();
        setCoupons(coupData);
      }

      const prodData = await prodRes.json();
      setProducts(prodData);
      
      if (uploadsRes.ok) {
        const uploadsData = await uploadsRes.json();
        setUploadedImages(uploadsData.map(url => ({ key: url, url: url })));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const toggleStoreLock = async () => {
    const newState = !isStoreLocked;
    const res = await authenticatedFetch('/api/config', {
      method: 'PUT',
      body: JSON.stringify({ isLocked: newState })
    });
    if (res && res.ok) {
      setIsStoreLocked(newState);
      alert(`Store is now ${newState ? 'Locked (Coming Soon)' : 'Unlocked (Live)'}`);
    }
  };

  const updateStatus = async (id, status) => {
    const res = await authenticatedFetch(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (res && res.ok) {
      fetchData();
      alert('Status updated!');
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    const res = await authenticatedFetch('/api/orders/manual', {
      method: 'POST',
      body: JSON.stringify({
        customer: newOrder.customer,
        items: [{ name: newOrder.items }],
        total: newOrder.total,
        status: newOrder.status
      })
    });
    if (res && res.ok) {
      fetchData();
      setNewOrder({ items: '', total: '', status: 'Pending', customer: '' });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Parse the comma-separated images
    const imgArray = newProduct.imagesString.split(',').map(s => s.trim()).filter(s => s !== '');
    
    // Parse the comma-separated colors
    const colorArray = newProduct.colorsString.split(',').map(s => s.trim()).filter(s => s !== '');
    
    const productToSubmit = {
      ...newProduct,
      image: imgArray[0] || 'product_1.png',
      images: imgArray,
      colors: colorArray
    };
    delete productToSubmit.imagesString;
    delete productToSubmit.colorsString;

    const res = await authenticatedFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(productToSubmit)
    });
    
    if (res && res.ok) {
      fetchData();
      setNewProduct({ 
        name: '', 
        price: '', 
        originalPrice: '', 
        category: 'New Arrival', 
        image: 'product_1.png', 
        imagesString: '', 
        colorsString: '', 
        tag: '', 
        isTrending: false, 
        inventory: 5 
      });
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      const res = await authenticatedFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res && res.ok) fetchData();
    }
  };

  const toggleTrending = async (product) => {
    const res = await authenticatedFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isTrending: !product.isTrending })
    });
    if (res && res.ok) fetchData();
  };

  const updateProduct = async (id, updates) => {
    const res = await authenticatedFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res && res.ok) fetchData();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-token': sessionStorage.getItem('aura_admin_token')
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const currentImages = newProduct.imagesString.split(',').map(s => s.trim()).filter(s => s !== '');
          currentImages.push(data.url);
          setNewProduct({ ...newProduct, imagesString: currentImages.join(', ') });
          setUploadedImages(prev => [...prev, { key: data.url, url: data.url }]);
        }
      } else if (res.status === 401) {
        alert('Session expired. Please login again.');
        onLogout();
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleDeleteGalleryImage = async (e, imageUrl) => {
    e.stopPropagation(); // Prevent selecting the image when clicking delete
    if (!window.confirm('Delete this image permanently?')) return;

    const filename = imageUrl.split('/').pop();
    try {
      const res = await authenticatedFetch(`/api/uploads/${filename}`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        setUploadedImages(prev => prev.filter(img => img.url !== imageUrl));
        // Also remove from current product selection if present
        let currentImages = newProduct.imagesString.split(',').map(s => s.trim()).filter(s => s !== '');
        if (currentImages.includes(imageUrl)) {
          currentImages = currentImages.filter(s => s !== imageUrl);
          setNewProduct({ ...newProduct, imagesString: currentImages.join(', ') });
        }
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  if (loading) return <div className="admin-loading">Accessing Dashboard...</div>;

  // Analytics
  const totalRevenue = orders.reduce((sum, o) => {
    const val = parseFloat(o.total.replace('₹','').replace(/,/g,''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  // Analytics Data Prep
  const revenueByDate = orders.reduce((acc, order) => {
    const dateStr = order.date.split(',')[0];
    const val = parseFloat(order.total.replace('₹','').replace(/,/g,''));
    const amount = isNaN(val) ? 0 : val;
    acc[dateStr] = (acc[dateStr] || 0) + amount;
    return acc;
  }, {});

  const chartData = Object.keys(revenueByDate).map(date => ({
    date,
    revenue: revenueByDate[date]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const statusCount = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCount).map(status => ({
    name: status,
    value: statusCount[status]
  }));

  const COLORS = {
    'Delivered': '#000000',
    'Shipped': '#666666',
    'Pending': '#cccccc'
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h1>suddenly</h1>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-group-title">OVERVIEW</span>
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </button>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">MANAGEMENT</span>
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Products
            </button>
            <button className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Categories
            </button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Orders
            </button>
            <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              Reviews
            </button>
            <button className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-1.761 1.761a2 2 0 0 0 0 2.828L15 11.35m-6 0l1.761-1.761a2 2 0 0 0 0-2.828L9 5m6 14l-1.761-1.761a2 2 0 0 0 0-2.828L15 12.65m-6 0l1.761 1.761a2 2 0 0 0 0 2.828L9 19"></path><rect x="2" y="5" width="20" height="14" rx="2"></rect></svg>
              Coupons
            </button>
            <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
              Inventory
            </button>
            <button className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Content
            </button>
            <button className={`nav-item ${activeTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveTab('marketing')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Marketing
            </button>
            <button className={`nav-item ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
              Returns
            </button>
            <button className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
              Support
            </button>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">SYSTEM</span>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Settings
            </button>
            <button className="nav-item logout-btn" onClick={onLogout}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>Logout</button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-top-bar">
          <h2 className="page-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div className="top-bar-actions">
            <label className="store-lock-toggle">
              <input type="checkbox" checked={isStoreLocked} onChange={toggleStoreLock} />
              <span className={isStoreLocked ? 'locked' : 'live'}>
                {isStoreLocked ? 'Store Locked' : 'Store Live'}
              </span>
            </label>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <div className="stats-grid">
                <div className="stat-card-v2">
                  <div className="stat-info">
                    <span className="stat-label">TOTAL REVENUE</span>
                    <span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    <span className="stat-sub positive">↑ 12.5% from last month</span>
                  </div>
                  <div className="stat-icon-v2 revenue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                </div>
                <div className="stat-card-v2">
                  <div className="stat-info">
                    <span className="stat-label">TOTAL ORDERS</span>
                    <span className="stat-value">{orders.length}</span>
                    <span className="stat-sub">{orders.filter(o => o.status === 'Pending').length} pending fulfillment</span>
                  </div>
                  <div className="stat-icon-v2 orders"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>
                </div>
                <div className="stat-card-v2">
                  <div className="stat-info">
                    <span className="stat-label">PRODUCTS</span>
                    <span className="stat-value">{products.length}</span>
                    <span className="stat-sub">{products.filter(p => p.inventory <= 5).length} low stock alerts</span>
                  </div>
                  <div className="stat-icon-v2 products"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
                </div>
                <div className="stat-card-v2">
                  <div className="stat-info">
                    <span className="stat-label">CUSTOMERS</span>
                    <span className="stat-value">{[...new Set(orders.map(o => o.customer))].length}</span>
                    <span className="stat-sub">Active shoppers</span>
                  </div>
                  <div className="stat-icon-v2 customers"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-card-v2">
                  <h3>Revenue Trend</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="chart-card-v2">
                  <h3>Fulfillment Status</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#eee'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                      {pieData.map(d => (
                        <div key={d.name} className="legend-item">
                          <span className="dot" style={{backgroundColor: COLORS[d.name]}}></span>
                          <span className="label">{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <section className="admin-section-v2">
              <div className="section-header-v2">
                <h3>Products</h3>
                <div className="header-actions">
                  <button className="btn-secondary">Download Template</button>
                  <button className="btn-secondary indigo">Import CSV</button>
                  <button className="btn-primary gold" onClick={() => setIsGalleryOpen(true)}>+ Add Product</button>
                </div>
              </div>

              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th width="40"><input type="checkbox" /></th>
                      <th>IMAGE</th>
                      <th>NAME</th>
                      <th>PRICE</th>
                      <th>BADGE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td><input type="checkbox" /></td>
                        <td><img src={getImageUrl(p.image)} alt={p.name} className="table-thumb" /></td>
                        <td className="font-medium">{p.name}</td>
                        <td>{p.price}</td>
                        <td>
                          {p.inventory <= 5 ? (
                            <span className="badge-v2 red">LOW STOCK ({p.inventory})</span>
                          ) : (
                            <span className="badge-v2 muted">In Stock</span>
                          )}
                        </td>
                        <td>
                          <div className="status-pills">
                            <span className="pill-active">Active</span>
                            {p.isTrending && <span className="pill-featured">Featured</span>}
                          </div>
                        </td>
                        <td>
                          <div className="row-actions-v2">
                            <button className="icon-btn edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                            <button className="icon-btn delete" onClick={() => deleteProduct(p.id)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'content' && (
            <div className="content-editor-view">
              <div className="editor-header">
                <h3>Home Page Editor</h3>
                <button className="btn-primary save-btn" onClick={() => {
                  fetch('/api/config', {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-admin-token': sessionStorage.getItem('aura_admin_token')
                    },
                    body: JSON.stringify({ homePage: homePageConfig })
                  }).then(() => alert('Changes saved successfully!'));
                }}>SAVE CHANGES</button>
              </div>

              <div className="editor-tabs">
                <button className="active">Content Sections</button>
                <button>Footer</button>
                <button>Pages</button>
              </div>

              <div className="editor-layout">
                <div className="editor-main">
                  <div className="editor-card countdown-card">
                    <div className="card-info">
                      <h4>Luxury Launch / Countdown</h4>
                      <p>Enable this to replace the landing page with a countdown timer.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={homePageConfig.enableCountdown}
                        onChange={(e) => setHomePageConfig({...homePageConfig, enableCountdown: e.target.checked})}
                      />
                      <span className="slider round"></span>
                      <span className="switch-label">Enable Countdown</span>
                    </label>
                  </div>

                  <div className="section-list">
                    {homePageConfig.sections.map((sec, idx) => (
                      <div key={sec.id} className="draggable-section">
                        <div className="drag-handle">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                        </div>
                        <div className="section-details">
                          <div className="section-name-row">
                            <strong>{sec.name}</strong>
                            {!sec.enabled && <span className="disabled-pill">Disabled</span>}
                          </div>
                          <span className="section-id">ID: {sec.id}...</span>
                        </div>
                        <div className="section-actions">
                          <button className="icon-btn" onClick={() => {
                            const newSecs = [...homePageConfig.sections];
                            newSecs[idx].enabled = !newSecs[idx].enabled;
                            setHomePageConfig({...homePageConfig, sections: newSecs});
                          }}>
                            {sec.enabled ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="editor-tips">
                  <h4>Tips</h4>
                  <ul>
                    <li>Use high-resolution images for banners.</li>
                    <li>"Hero" should usually be at the top.</li>
                    <li>You can have multiple "Product Sliders" with different filters.</li>
                  </ul>
                </aside>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <section className="admin-section-v2">
              <div className="section-header-v2">
                <h3>Order Fulfillment</h3>
              </div>

              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className="font-medium">{o.id}</td>
                        <td>{o.customer}</td>
                        <td>{o.date}</td>
                        <td>{o.total}</td>
                        <td>
                          <span className={`status-pill ${o.status.toLowerCase()}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="status-select"
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Management Sections */}
          {activeTab === 'categories' && (
            <section className="admin-section-v2">
              <div className="section-header-v2">
                <h3>Category Management</h3>
                <button className="btn-primary">Add New Category</button>
              </div>
              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>TOTAL PRODUCTS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, i) => (
                      <tr key={i}>
                        <td className="font-medium">{cat}</td>
                        <td>{products.filter(p => p.category === cat).length} Products</td>
                        <td><span className="status-pill delivered">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'coupons' && (
            <section className="admin-section-v2">
              <div className="section-header-v2">
                <h3>Discount Coupons</h3>
                <button className="btn-primary">Generate Coupon</button>
              </div>
              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>CODE</th>
                      <th>TYPE</th>
                      <th>VALUE</th>
                      <th>EXPIRY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c, i) => (
                      <tr key={i}>
                        <td className="font-medium">{c.code}</td>
                        <td>{c.type}</td>
                        <td>{c.type === 'percentage' ? `${c.discount}%` : `₹${c.discount}`}</td>
                        <td>31 Dec 2024</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'inventory' && (
            <section className="admin-section-v2">
              <div className="section-header-v2">
                <h3>Inventory Tracking</h3>
              </div>
              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>CURRENT STOCK</th>
                      <th>ALERTS</th>
                      <th>UPDATE STOCK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.inventory} units</td>
                        <td>
                          {p.inventory <= 5 && <span className="status-pill cancelled">Low Stock</span>}
                          {p.inventory > 5 && <span className="status-pill delivered">Optimal</span>}
                        </td>
                        <td>
                          <div style={{display: 'flex', gap: '10px'}}>
                            <input 
                              type="number" 
                              style={{width: '60px', padding: '5px'}} 
                              defaultValue={p.inventory}
                              onBlur={(e) => updateProduct(p.id, { inventory: e.target.value })}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="admin-section-v2">
              <div className="section-header-v2">
                <h3>System Settings</h3>
                <button className="btn-primary" onClick={() => alert('Settings Saved!')}>Save Changes</button>
              </div>
              <div className="settings-grid-v2">
                <div className="settings-card">
                  <h4>General Store Details</h4>
                  <div className="form-group">
                    <label>Store Name</label>
                    <input type="text" defaultValue="Suddenly Luxury" />
                  </div>
                  <div className="form-group">
                    <label>Currency Symbol</label>
                    <input type="text" defaultValue="₹" />
                  </div>
                </div>
                <div className="settings-card">
                  <h4>Store Availability</h4>
                  <div className="toggle-group">
                    <span>Store Status</span>
                    <button className={`btn-secondary ${!isStoreLocked ? 'active' : ''}`} onClick={toggleStoreLock}>
                      {isStoreLocked ? 'Open Store' : 'Close Store'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'reviews' && (
            <div className="placeholder-view">
              <div className="placeholder-icon">⭐️</div>
              <h3>Customer Reviews</h3>
              <p>Manage and respond to customer feedback and ratings.</p>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="placeholder-view">
              <div className="placeholder-icon">📧</div>
              <h3>Marketing Campaigns</h3>
              <p>Run email campaigns and manage newsletter subscribers.</p>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="placeholder-view">
              <div className="placeholder-icon">🔄</div>
              <h3>Returns & Refunds</h3>
              <p>Process customer returns and manage refund requests.</p>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="placeholder-view">
              <div className="placeholder-icon">🎧</div>
              <h3>Customer Support</h3>
              <p>Respond to customer inquiries and support tickets.</p>
            </div>
          )}
        </div>
      </main>

      {/* Media Library Modal Remains Same but styled */}
      {isGalleryOpen && (
        <div className="media-library-overlay" onClick={() => setIsGalleryOpen(false)}>
          <div className="media-library-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsGalleryOpen(false)}>&times;</button>
            <h2>Media Library Picker</h2>
            <div className="media-grid">
              {[...getAllImages(), ...uploadedImages].map(({ key, url }) => {
                const isSelected = newProduct.imagesString.split(',').map(s => s.trim()).includes(key);
                return (
                  <div key={key} className={`media-item ${isSelected ? 'selected' : ''}`} onClick={() => toggleImageInForm(key)}>
                    <img src={url} alt={key} />
                    <span>{key}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
