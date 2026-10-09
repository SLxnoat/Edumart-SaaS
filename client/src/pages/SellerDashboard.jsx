import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSellerDashboard } from '../api';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch seller dashboard data
  useEffect(() => {
    let cancelled = false;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSellerDashboard();
        if (cancelled) return;
        setDashboardData(data);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          navigate('/login');
          return;
        }
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="seller-dashboard-loading">
          <div className="dashboard-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>Seller Dashboard</h1>
          </div>
          <div className="dashboard-content">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="dashboard-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Seller Dashboard</h1>
        </div>
        <div className="dashboard-content">
          <div className="alert alert-error">
            {error}
            <button className="btn btn-sm btn-link" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no data (shouldn't happen with mock data, but just in case)
  if (!dashboardData) {
    return (
      <div className="page-shell">
        <div className="dashboard-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Seller Dashboard</h1>
        </div>
        <div className="dashboard-content">
          <div className="alert alert-info">
            No data available. Please check your connection or contact support.
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats || {};
  const recentOrders = dashboardData.recentOrders || [];
  const topProducts = dashboardData.topProducts || [];
  const performance = dashboardData.performance || {
    viewsThisWeek: 120,
    viewsChange: 5.2,
    salesThisWeek: recentOrders.length,
    salesChange: 1.5,
    revenueThisWeek: Number(stats.totalSales || 0),
    revenueChange: 3.8,
  };

  return (
    <div className="page-shell">
      <div className="dashboard-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>Seller Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your EduMart store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Sales</h3>
            <p className="stat-value">${Number(stats.totalSales || 0).toLocaleString()}</p>
            <p className="stat-label">Lifetime revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders || 0}</p>
            <p className="stat-label">Orders to fulfill</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Products Listed</h3>
            <p className="stat-value">{stats.totalProducts || 0}</p>
            <p className="stat-label">Active listings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Avg Order Value</h3>
            <p className="stat-value">${Number(stats.avgOrderValue || stats.conversionRate || 0).toFixed(2)}</p>
            <p className="stat-label">Sales performance</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-section">
        <h2>Recent Orders</h2>
        <div className="section-actions">
          <Link to="/seller/orders" className="btn btn-outline">
            View All Orders
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => {
                  const orderId = order.orderNumber || order.id || `ORD-${idx + 1}`;
                  const customer = order.customerName || order.customer || order.customerEmail || 'Customer';
                  const amount = Number(order.amount ?? order.itemTotal ?? 0);
                  const status = (order.orderStatus || order.status || 'pending').toLowerCase();
                  const date = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent');
                  return (
                    <tr key={order.id || idx}>
                      <td>{orderId}</td>
                      <td>{customer}</td>
                      <td>${amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${status}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td>{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No recent orders found.</p>
        )}
      </div>

      {/* Top Products Section */}
      <div className="dashboard-section">
        <h2>Top Performing Products</h2>
        <div className="section-actions">
          <Link to="/seller/products" className="btn btn-outline">
            Manage Products
          </Link>
        </div>

        {topProducts.length > 0 ? (
          <div className="products-grid">
            {topProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-meta">
                    <span>👁️ {Number(product.views || 0).toLocaleString()} views</span>
                    {product.sales !== undefined && <span>🛒 {product.sales} sales</span>}
                  </div>
                  <div className="product-revenue">
                    <strong>${Number(product.revenue ?? product.price ?? 0).toLocaleString()}</strong> {product.revenue !== undefined ? 'revenue' : 'price'}
                  </div>
                </div>
                <div className="product-actions">
                  <Link to="/seller/products" className="btn btn-sm btn-outline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No products found.</p>
        )}
      </div>

      {/* Performance Section */}
      <div className="dashboard-section">
        <h2>Weekly Performance</h2>
        <div className="performance-grid">
          <div className="performance-card">
            <h3>Views This Week</h3>
            <p className="performance-value">{performance.viewsThisWeek.toLocaleString()}</p>
            <p className={`performance-change ${performance.viewsChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.viewsChange >= 0 ? '+' : ''}{performance.viewsChange}%
            </p>
          </div>

          <div className="performance-card">
            <h3>Sales This Week</h3>
            <p className="performance-value">{performance.salesThisWeek}</p>
            <p className={`performance-change ${performance.salesChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.salesChange >= 0 ? '+' : ''}{performance.salesChange}%
            </p>
          </div>

          <div className="performance-card">
            <h3>Revenue This Week</h3>
            <p className="performance-value">${Number(performance.revenueThisWeek || 0).toLocaleString()}</p>
            <p className={`performance-change ${performance.revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.revenueChange >= 0 ? '+' : ''}{performance.revenueChange}%
            </p>
          </div>
        </div>

        <div className="section-actions">
          <Link to="/seller/analytics" className="btn btn-outline">
            View Detailed Analytics
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/seller/upload" className="quick-action-card">
            <div className="action-icon">📤</div>
            <h3>Add New Product</h3>
            <p>Upload and list your learning materials</p>
          </Link>

          <Link to="/seller/earnings" className="quick-action-card">
            <div className="action-icon">💳</div>
            <h3>View Earnings</h3>
            <p>Check your sales and request payouts</p>
          </Link>

          <Link to="/seller/orders" className="quick-action-card">
            <div className="action-icon">📋</div>
            <h3>Manage Orders</h3>
            <p>Process and fulfill customer orders</p>
          </Link>

          <Link to="/seller/analytics" className="quick-action-card">
            <div className="action-icon">📊</div>
            <h3>Analytics</h3>
            <p>Deep dive into your store performance</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;