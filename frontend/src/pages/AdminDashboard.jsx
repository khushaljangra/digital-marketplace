import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import Loader from '../components/Loader';
import {
  LayoutDashboard,
  FolderOpen,
  Ticket,
  PlusCircle,
  Trash2,
  Edit2,
  FileCheck,
  CheckCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Layers,
  Lightbulb,
  ThumbsUp,
  Star,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics Stats State
  const [stats, setStats] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Products State
  const [projects, setProjects] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Add Product Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('source-code');
  const [techStack, setTechStack] = useState('');
  const [previewUrls, setPreviewUrls] = useState('');
  const [file, setFile] = useState(null);
  const [externalDownloadUrl, setExternalDownloadUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponValue, setCouponValue] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponLimit, setCouponLimit] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);

  // Feature Requests State
  const [featureRequests, setFeatureRequests] = useState([]);
  const [featureRequestsLoading, setFeatureRequestsLoading] = useState(false);

  // Edit Project State
  const [editingProject, setEditingProject] = useState(null);

  // Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Reviews State
  const [allReviews, setAllReviews] = useState([]);
  const [allReviewsLoading, setAllReviewsLoading] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const data = await request('/analytics/dashboard', 'GET');
      if (data.success) {
        setStats(data.stats);
        setMonthlySales(data.monthlySales);
        setTopProjects(data.topProjects);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error('Error fetching analytics stats:', error.message);
    }
  };

  const fetchProjects = async () => {
    setProductsLoading(true);
    try {
      const data = await request('/projects', 'GET');
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects list:', error.message);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const data = await request('/coupons', 'GET');
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await request('/orders', 'GET');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  const fetchAllFeatureRequests = async () => {
    setFeatureRequestsLoading(true);
    try {
      const data = await request('/feature-requests', 'GET');
      if (data.success) {
        setFeatureRequests(data.featureRequests);
      }
    } catch (error) {
      console.error('Error fetching feature requests:', error.message);
    } finally {
      setFeatureRequestsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const data = await request('/support/subscribers', 'GET');
      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error.message);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const fetchAllReviews = async () => {
    setAllReviewsLoading(true);
    try {
      const data = await request('/reviews', 'GET');
      if (data.success) {
        setAllReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching all reviews:', error.message);
    } finally {
      setAllReviewsLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subId) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      const data = await request(`/support/subscribers/${subId}`, 'DELETE');
      if (data.success) {
        alert('Subscriber deleted successfully!');
        setSubscribers(subscribers.filter(s => s._id !== subId));
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const data = await request(`/reviews/${reviewId}`, 'DELETE');
      if (data.success) {
        alert('Review deleted successfully!');
        setAllReviews(allReviews.filter(r => r._id !== reviewId));
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleDeleteFeatureRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this feature bid?')) return;
    try {
      const data = await request(`/feature-requests/${requestId}`, 'DELETE');
      if (data.success) {
        alert('Feature bid deleted successfully!');
        setFeatureRequests(featureRequests.filter(r => r._id !== requestId));
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleUpdateFeatureStatus = async (requestId, status) => {
    if (!window.confirm(`Mark this feature request as ${status.toUpperCase()}?`)) return;
    try {
      const data = await request(`/feature-requests/${requestId}`, 'PATCH', { status });
      if (data.success) {
        alert('Feature request status updated successfully!');
        fetchAllFeatureRequests();
      }
    } catch (error) {
      alert(error.message || 'Failed to update status');
    }
  };

  const handleApproveUtr = async (orderId) => {
    if (!window.confirm('Approve this UTR payment and unlock downloads?')) return;
    try {
      const data = await request(`/orders/verify-utr/${orderId}`, 'POST');
      if (data.success) {
        alert('Order approved successfully! Download access has been unlocked.');
        fetchOrders();
        fetchDashboardStats();
      }
    } catch (error) {
      alert(error.message || 'Verification failed');
    }
  };

  const handleRejectUtr = async (orderId) => {
    if (!window.confirm('Reject this UTR payment?')) return;
    try {
      const data = await request(`/orders/reject-utr/${orderId}`, 'POST');
      if (data.success) {
        alert('Order rejected successfully.');
        fetchOrders();
      }
    } catch (error) {
      alert(error.message || 'Rejection failed');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this transaction record?')) return;
    try {
      const data = await request(`/orders/${orderId}`, 'DELETE');
      if (data.success) {
        alert('Transaction record deleted successfully.');
        setOrders(orders.filter((o) => o._id !== orderId));
        await fetchDashboardStats();
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleStartEdit = (proj) => {
    setEditingProject(proj);
    setTitle(proj.title || '');
    setDescription(proj.description || '');
    setPrice(proj.price || '');
    setCategory(proj.category || 'source-code');
    setTechStack(proj.techStack ? proj.techStack.join(', ') : '');
    setPreviewUrls(proj.previewUrls ? proj.previewUrls.join('\n') : '');
    setExternalDownloadUrl(proj.externalDownloadUrl || '');
    setFile(null);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('source-code');
    setTechStack('');
    setPreviewUrls('');
    setExternalDownloadUrl('');
    setFile(null);
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchProjects();
    fetchCoupons();
    fetchOrders();
    fetchAllFeatureRequests();
    fetchSubscribers();
    fetchAllReviews();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!editingProject && !file && !externalDownloadUrl) {
      setFormError('Please select a project ZIP/PDF file to upload or enter a Google Drive link.');
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('techStack', techStack);
      formData.append('externalDownloadUrl', externalDownloadUrl);
      if (file) {
        formData.append('file', file);
      }
      
      if (previewUrls) {
        const urls = previewUrls.split('\n').map((u) => u.trim()).filter((u) => u);
        formData.append('previewUrls', JSON.stringify(urls));
      } else {
        formData.append('previewUrls', JSON.stringify([]));
      }

      let data;
      if (editingProject) {
        data = await request(`/projects/${editingProject._id}`, 'PUT', formData, true);
      } else {
        data = await request('/projects', 'POST', formData, true);
      }

      if (data.success) {
        setFormSuccess(editingProject ? 'Project updated successfully!' : 'Project uploaded and cataloged successfully!');
        handleCancelEdit();
        // Refresh products list & stats
        await fetchProjects();
        await fetchDashboardStats();
      }
    } catch (error) {
      setFormError(error.message || 'Error saving project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      const data = await request(`/projects/${projId}`, 'DELETE');
      if (data.success) {
        setProjects(projects.filter((p) => p._id !== projId));
        await fetchDashboardStats();
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponLoading(true);
    try {
      const body = {
        code: couponCode.toUpperCase(),
        discountType: couponType,
        discountValue: Number(couponValue),
        expiryDate: new Date(couponExpiry),
      };
      if (couponLimit) {
        body.usageLimit = Number(couponLimit);
      }

      const data = await request('/coupons', 'POST', body);
      if (data.success) {
        setCouponCode('');
        setCouponValue('');
        setCouponExpiry('');
        setCouponLimit('');
        await fetchCoupons();
      }
    } catch (error) {
      alert(error.message || 'Failed to create coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete coupon code?')) return;
    try {
      const data = await request(`/coupons/${couponId}`, 'DELETE');
      if (data.success) {
        setCoupons(coupons.filter((c) => c._id !== couponId));
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  // Generate Custom SVG chart dimensions
  const chartHeight = 160;
  const chartWidth = 600;
  const maxRevenue = monthlySales.reduce((max, s) => Math.max(max, s.revenue), 100);

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Title */}
      <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '32px' }}>
        Administration Dashboard
      </h2>

      {/* Tabs list */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px',
        marginBottom: '32px'
      }}>
        {[
          { id: 'analytics', label: 'Stats', icon: <LayoutDashboard size={16} /> },
          { id: 'products', label: 'Products', icon: <FolderOpen size={16} /> },
          { id: 'coupons', label: 'Coupons', icon: <Ticket size={16} /> },
          { id: 'orders', label: 'Transactions', icon: <ShoppingCart size={16} /> },
          { id: 'feature_requests', label: 'Feature Bids', icon: <Lightbulb size={16} /> },
          { id: 'subscribers', label: 'Subscribers', icon: <Users size={16} /> },
          { id: 'reviews', label: 'Reviews', icon: <Star size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '6px',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics stats tab */}
      {activeTab === 'analytics' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Numeric Metric cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '12px' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Revenue</span>
                <strong style={{ display: 'block', fontSize: '22px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>INR {stats.totalRevenue}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '12px' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Sales Orders</span>
                <strong style={{ display: 'block', fontSize: '22px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{stats.totalOrders}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderRadius: '12px' }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Registered Buyers</span>
                <strong style={{ display: 'block', fontSize: '22px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{stats.totalUsers}</strong>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', borderRadius: '12px' }}>
                <Layers size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Catalog Items</span>
                <strong style={{ display: 'block', fontSize: '22px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{stats.totalProjects}</strong>
              </div>
            </div>
          </div>

          {/* Monthly Sales Revenue Chart (Custom SVG Line) */}
          {monthlySales.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Monthly Sales Revenue Trend
              </h3>
              
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ width: '100%', minWidth: '550px' }}>
                  {/* Defs for gradient (at the top of SVG for older browsers / Safari support) */}
                  <defs>
                    <linearGradient id="gradient-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                    <line
                      key={i}
                      x1="40"
                      y1={chartHeight - r * chartHeight + 10}
                      x2={chartWidth - 20}
                      y2={chartHeight - r * chartHeight + 10}
                      stroke="var(--border)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Draw Revenue Line */}
                  <path
                    d={monthlySales
                      .map((val, idx) => {
                        const x = 50 + (idx * (chartWidth - 100)) / (monthlySales.length - 1 || 1);
                        const y = chartHeight - (val.revenue / maxRevenue) * chartHeight + 10;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Glow Area under path */}
                  <path
                    d={`${monthlySales
                      .map((val, idx) => {
                        const x = 50 + (idx * (chartWidth - 100)) / (monthlySales.length - 1 || 1);
                        const y = chartHeight - (val.revenue / maxRevenue) * chartHeight + 10;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')} L ${50 + (monthlySales.length - 1) * ((chartWidth - 100) / (monthlySales.length - 1 || 1))} ${chartHeight + 10} L 50 ${chartHeight + 10} Z`}
                    fill="linear-gradient(to bottom, rgba(99, 102, 241, 0.2), transparent)"
                    style={{ fill: 'url(#gradient-glow)' }}
                  />

                  {/* Graph node dots */}
                  {monthlySales.map((val, idx) => {
                    const x = 50 + (idx * (chartWidth - 100)) / (monthlySales.length - 1 || 1);
                    const y = chartHeight - (val.revenue / maxRevenue) * chartHeight + 10;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="5" fill="var(--secondary)" stroke="white" strokeWidth="1.5" />
                        <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontWeight="bold">
                          ₹{val.revenue}
                        </text>
                        {/* Month Labels */}
                        <text x={x} y={chartHeight + 25} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
                          {val.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Tables layout (top selling / recent orders) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top Projects */}
            <div className="glass-card">
              <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                Best Selling Products
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px 4px' }}>Project Title</th>
                      <th style={{ padding: '10px 4px' }}>Price</th>
                      <th style={{ padding: '10px 4px' }}>Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProjects.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 4px', color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</td>
                        <td style={{ padding: '10px 4px' }}>INR {p.price}</td>
                        <td style={{ padding: '10px 4px', color: 'var(--accent)' }}>{p.downloadCount} dl</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glass-card">
              <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                Recent Order Placements
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px 4px' }}>Customer</th>
                      <th style={{ padding: '10px 4px' }}>Amount</th>
                      <th style={{ padding: '10px 4px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 4px', color: 'var(--text-primary)' }}>{o.user?.email || 'N/A'}</td>
                        <td style={{ padding: '10px 4px' }}>INR {o.totalAmount}</td>
                        <td style={{ padding: '10px 4px' }}>
                          <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Manage Products Tab */}
      {activeTab === 'products' && (
        <div className="responsive-admin-grid" style={{
          alignItems: 'flex-start'
        }}>
          {/* Left: Products catalog table list */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              Current Catalog ({projects.length} Items)
            </h3>
            {productsLoading ? (
              <Loader />
            ) : projects.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>Catalog is empty. Upload a project using the right sidebar!</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px' }}>Project Info</th>
                      <th style={{ padding: '12px 8px' }}>Category</th>
                      <th style={{ padding: '12px 8px' }}>Price</th>
                      <th style={{ padding: '12px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((proj) => (
                      <tr key={proj._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{proj.title}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>File: {proj.fileName} ({proj.fileSize})</span>
                        </td>
                        <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{proj.category}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>INR {proj.price}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            onClick={() => handleStartEdit(proj)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '10px' }}
                            title="Edit Project"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj._id)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Sidebar: Upload Product Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {editingProject ? (
                <>
                  <Edit2 size={18} style={{ color: 'var(--primary)' }} /> Edit Project Details
                </>
              ) : (
                <>
                  <PlusCircle size={18} style={{ color: 'var(--primary)' }} /> Upload New Project
                </>
              )}
            </h3>
            
            {formSuccess && <div style={{ color: 'var(--success)', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>{formSuccess}</div>}
            {formError && <div style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>{formError}</div>}

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="E.g., Chatbot UI Source Code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                <textarea
                  required
                  rows="3"
                  className="form-input"
                  placeholder="Detail the project highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Price (INR)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="299"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="source-code">Source Code</option>
                    <option value="templates">Templates</option>
                    <option value="pdfs">PDF / eBook</option>
                    <option value="graphics">Graphics</option>
                    <option value="datasets">Datasets</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tech Stack (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React, Node.js, Mongoose"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Preview Image URLs (one per line)</label>
                <textarea
                  rows="2"
                  className="form-input"
                  placeholder="https://image-url.com/preview.png"
                  value={previewUrls}
                  onChange={(e) => setPreviewUrls(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Google Drive / External Link (Preferred for Render)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={externalDownloadUrl}
                  onChange={(e) => setExternalDownloadUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Project Zip/PDF File (Optional if Link provided)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    width: '100%'
                  }}
                />
              </div>

              <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ padding: '12px', width: '100%', marginTop: '10px' }}>
                {formLoading ? 'Saving...' : editingProject ? 'Save Changes' : 'Publish Product'}
              </button>
              {editingProject && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                  style={{ padding: '10px', width: '100%', marginTop: '8px' }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="responsive-admin-grid" style={{
          alignItems: 'flex-start'
        }}>
          {/* Left coupons list table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              Active Coupon Codes
            </h3>
            {coupons.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>No promo coupons configured yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px' }}>Coupon Code</th>
                      <th style={{ padding: '12px 8px' }}>Discount Value</th>
                      <th style={{ padding: '12px 8px' }}>Expiry Date</th>
                      <th style={{ padding: '12px 8px' }}>Used Count</th>
                      <th style={{ padding: '12px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 'bold' }}>{c.code}</td>
                        <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                          {c.discountValue}{c.discountType === 'percentage' ? '%' : ' INR'} Off
                        </td>
                        <td style={{ padding: '12px 8px' }}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'times'}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Create Coupon Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <Ticket size={18} style={{ color: 'var(--primary)' }} /> Create Promo Coupon
            </h3>

            <form onSubmit={handleCreateCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="WELCOME50"
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Type</label>
                  <select
                    className="form-input"
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                  >
                    <option value="percentage">Percent (%)</option>
                    <option value="fixed">Fixed (INR)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Value</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    className="form-input"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Expiry Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={couponExpiry}
                  onChange={(e) => setCouponExpiry(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Usage Limit (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave blank for unlimited"
                  className="form-input"
                  value={couponLimit}
                  onChange={(e) => setCouponLimit(e.target.value)}
                />
              </div>

              <button type="submit" disabled={couponLoading} className="btn btn-primary" style={{ padding: '12px', width: '100%', marginTop: '10px' }}>
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Transactions List Tab */}
      {activeTab === 'orders' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Checkout Transactions Log
          </h3>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>No customer checkouts recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px' }}>Transaction Date</th>
                    <th style={{ padding: '12px 8px' }}>User Details</th>
                    <th style={{ padding: '12px 8px' }}>Purchased Catalog Item(s)</th>
                    <th style={{ padding: '12px 8px' }}>Paid Total</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{o.user?.name || 'N/A'}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.user?.email || 'N/A'}</span>
                        {o.paymentMethod === 'qr_code' && (
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg-tertiary)',
                            borderLeft: '3px solid var(--accent)',
                            fontSize: '11px',
                            lineHeight: '1.4'
                          }}>
                            <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              UTR: {o.transactionRef}
                            </span>
                            <span style={{ display: 'block', color: 'var(--text-secondary)' }}>
                              Pay Email: {o.contactEmail || 'N/A'}
                            </span>
                            <span style={{ display: 'block', color: 'var(--text-secondary)' }}>
                              Phone: {o.contactPhone || 'N/A'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <ul style={{ paddingLeft: '16px', margin: 0 }}>
                          {o.items?.map((item, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                              {item.titleAtPurchase} (INR {item.priceAtPurchase})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>INR {o.totalAmount}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {o.paymentStatus === 'pending_verification' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '11px' }}>
                              PENDING VERIFICATION
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleApproveUtr(o._id)}
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px' }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectUtr(o._id)}
                                className="btn btn-danger"
                                style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px' }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: o.paymentStatus === 'paid' ? 'var(--success)' : o.paymentStatus === 'pending' ? 'var(--warning)' : 'var(--error)'
                          }}>
                            {o.paymentStatus === 'paid' ? <CheckCircle size={12} /> : null}
                            {o.paymentStatus.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          onClick={() => handleDeleteOrder(o._id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                          title="Delete Transaction Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Feature Requests Management Tab */}
      {activeTab === 'feature_requests' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Custom Feature Requests & Developer Bids
          </h3>
          
          {featureRequestsLoading ? (
            <Loader />
          ) : featureRequests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>No customer feature requests recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px' }}>Project Info</th>
                    <th style={{ padding: '12px 8px' }}>User Details</th>
                    <th style={{ padding: '12px 8px' }}>Feature Request Details</th>
                    <th style={{ padding: '12px 8px' }}>Bid Offer</th>
                    <th style={{ padding: '12px 8px' }}>Upvotes</th>
                    <th style={{ padding: '12px 8px' }}>Status & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {featureRequests.map((req) => (
                    <tr key={req._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                          {req.project?.title || 'Unknown Project'}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {req.project?._id || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{req.user?.name || 'Customer'}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.user?.email || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '12px 8px', maxWidth: '320px' }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>{req.title}</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{req.description}</p>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--success)' }}>
                        INR {req.bidAmount}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                        {req.upvotes?.length || 0} Upvotes
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className={`badge badge-${req.status === 'completed' ? 'success' : req.status === 'accepted' ? 'accent' : 'primary'}`} style={{ alignSelf: 'flex-start', fontSize: '10px' }}>
                            {req.status.toUpperCase()}
                          </span>
                          
                          {req.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateFeatureStatus(req._id, 'accepted')}
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px' }}
                            >
                              Accept Bid
                            </button>
                          )}
                          
                          {req.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateFeatureStatus(req._id, 'completed')}
                              className="btn btn-accent"
                              style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px' }}
                            >
                              Mark Completed
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteFeatureRequest(req._id)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px 0', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Delete Feature Request"
                          >
                            <Trash2 size={12} /> <span style={{ fontSize: '10px' }}>Delete Bid</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subscribers Manager Tab */}
      {activeTab === 'subscribers' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Newsletter Subscribers Log
          </h3>
          {subscribersLoading ? (
            <Loader />
          ) : subscribers.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>No email subscribers found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px' }}>Subscriber Email</th>
                    <th style={{ padding: '12px 8px' }}>Matched Name</th>
                    <th style={{ padding: '12px 8px' }}>Subscribed On</th>
                    <th style={{ padding: '12px 8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 'bold' }}>{sub.email}</td>
                      <td style={{ padding: '12px 8px' }}>{sub.user?.name || <em style={{ color: 'var(--text-muted)' }}>Non-Registered</em>}</td>
                      <td style={{ padding: '12px 8px' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          onClick={() => handleDeleteSubscriber(sub._id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                          title="Unsubscribe / Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Customer Reviews Log
          </h3>
          {allReviewsLoading ? (
            <Loader />
          ) : allReviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>No customer reviews recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px' }}>Project Info</th>
                    <th style={{ padding: '12px 8px' }}>User Details</th>
                    <th style={{ padding: '12px 8px' }}>Rating & Comment</th>
                    <th style={{ padding: '12px 8px' }}>Review Date</th>
                    <th style={{ padding: '12px 8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allReviews.map((rev) => (
                    <tr key={rev._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{rev.project?.title || 'Unknown Project'}</strong>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{rev.user?.name || 'Customer'}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rev.user?.email || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '12px 8px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', color: '#fbbf24', marginBottom: '4px', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < rev.rating ? '#fbbf24' : 'none'}
                              stroke="#fbbf24"
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{rev.comment}</p>
                      </td>
                      <td style={{ padding: '12px 8px' }}>{new Date(rev.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
