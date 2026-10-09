import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch seller dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch('/api/seller/dashboard', { credentials: 'include' });

        // For now, we'll simulate with placeholder data that matches expected structure
        // This data would normally come from the backend
        const mockData = {
          stats: {
            totalSales: 12450.75,
            pendingOrders: 8,
            totalProducts: 24,
            conversionRate: 3.2,
            avgOrderValue: 89.50,
            monthlyGrowth: 12.5
          },
          recentOrders: [
            {
              id: 'ORD-001234',
              customer: 'Jane Smith',
              amount: 89.99,
              status: 'processing',
              date: '2026-10-05'
            },
            {
              id: 'ORD-001233',
              customer: 'Michael Chen',
              amount: 156.50,
              status: 'shipped',
              date: '2026-10-04'
            },
            {
              id: 'ORD-001232',
              customer: 'Sarah Johnson',
              amount: 45.00,
              status: 'pending',
              date: '2026-10-04'
            }
          ],
          topProducts: [
            {
              id: 'PROD-001',
              name: 'Algebra 1 Past Papers Bundle',
              views: 1240,
              sales: 89,
              revenue: 7965.50
            },
            {
              id: 'PROD-002',
              name: 'Biology Revision Notes',
              views: 980,
              sales: 67,
              revenue: 3350.00
            },
            {
              id: 'PROD-003',
              name: 'Chemistry Exam Practice',
              views: 756,
              sales: 45,
              revenue: 2250.00
            }
          ],
          performance: {
            viewsThisWeek: 3420,
            viewsChange: 8.5,
            salesThisWeek: 12,
            salesChange: -2.1,
            revenueThisWeek: 1074.00,
            revenueChange: 5.3
          }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setDashboardData(mockData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
        // Redirect to login if not authenticated
        navigate('/login');
      }
    };

    fetchDashboardData();
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

  const { stats, recentOrders, topProducts, performance } = dashboardData;

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
            <p className="stat-value">${stats.totalSales.toLocaleString()}</p>
            <p className="stat-label">Lifetime revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
            <p className="stat-label">Orders to fulfill</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Products Listed</h3>
            <p className="stat-value">{stats.totalProducts}</p>
            <p className="stat-label">Active listings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Conversion Rate</h3>
            <p className="stat-value">{stats.conversionRate}%</p>
            <p className="stat-label">Views to sales ratio</p>
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
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>${order.amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
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
                    <span>👁️ {product.views.toLocaleString()} views</span>
                    <span>🛒 {product.sales} sales</span>
                  </div>
                  <div className="product-revenue">
                    <strong>${product.revenue.toLocaleString()}</strong> revenue
                  </div>
                </div>
                <div className="product-actions">
                  <Link to={`/seller/products/${product.id}/edit`} className="btn btn-sm btn-outline">
                    Edit
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
            <p className="performance-value">${performance.revenueThisWeek.toLocaleString()}</p>
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
          <Link to="/seller/products/create" className="quick-action-card">
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