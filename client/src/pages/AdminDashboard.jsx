import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminStats } from '../api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch admin dashboard data
  useEffect(() => {
    let cancelled = false;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminStats();
        if (cancelled) return;
        setDashboardData(data);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401 || err.status === 403) {
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
        <div className="admin-dashboard-loading">
          <div className="dashboard-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="dashboard-content">
            <div className="loading-spinner"></div>
            <p>Loading admin dashboard...</p>
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
          <h1>Admin Dashboard</h1>
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
          <h1>Admin Dashboard</h1>
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
  const recentActivity = dashboardData.recentActivity || [];
  const alerts = dashboardData.alerts || [];
  const performance = dashboardData.performance || {
    usersThisMonth: stats.totalUsers || 0,
    usersChange: 8.5,
    productsThisMonth: stats.totalProducts || 0,
    productsChange: 5.2,
    ordersThisMonth: stats.totalOrders || 0,
    ordersChange: 12.0,
    revenueThisMonth: stats.totalRevenue || 0,
    revenueChange: 18.4,
  };

  return (
    <div className="page-shell">
      <div className="dashboard-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Overview of EduMart platform performance and activity</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{Number(stats.totalUsers || 0).toLocaleString()}</p>
            <p className="stat-label">Registered accounts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Verified Users</h3>
            <p className="stat-value">{Number(stats.verifiedUsers || 0).toLocaleString()}</p>
            <p className="stat-label">Email verified</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{Number(stats.totalProducts || 0).toLocaleString()}</p>
            <p className="stat-label">Active listings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Products</h3>
            <p className="stat-value">{stats.pendingProducts || 0}</p>
            <p className="stat-label">Awaiting approval</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{Number(stats.totalOrders || 0).toLocaleString()}</p>
            <p className="stat-label">All time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders || 0}</p>
            <p className="stat-label">Awaiting processing</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${Number(stats.totalRevenue || 0).toLocaleString()}</p>
            <p className="stat-label">Platform earnings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Monthly Growth</h3>
            <p className="stat-value">{stats.monthlyGrowth || 12.5}%</p>
            <p className="stat-label">Month over month</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className={`activity-item activity-${activity.type}`}>
              <div className="activity-icon">
                {activity.type === 'user' ? '👤' :
                 activity.type === 'product' ? '📦' :
                 activity.type === 'order' ? '🛒' :
                 activity.type === 'review' ? '⭐' : '🔔'}
              </div>
              <div className="activity-details">
                <p className="activity-text">
                  <strong>{activity.user}</strong>
                  {activity.action === 'registered' ? 'registered' :
                   activity.action === 'approved' ? 'approved product' :
                   activity.action === 'placed' ? 'placed an order' :
                   activity.action === 'submitted' ? 'submitted a review' :
                   activity.action === 'role changed to admin' ? 'was promoted to admin' : activity.action}
                  {activity.product && ` on "${activity.product}"`}
                  {activity.amount && ` for $${activity.amount.toFixed(2)}`}
                </p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>System Alerts</h2>
        </div>
        {alerts.length > 0 ? (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert alert-${alert.type}`}>
                <div className="alert-content">
                  <p>{alert.message}</p>
                  <p className="alert-time">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No active alerts.</p>
        )}
      </div>

      {/* Performance Section */}
      <div className="dashboard-section">
        <h2>Monthly Performance</h2>
        <div className="performance-grid">
          <div className="performance-card">
            <h3>New Users</h3>
            <p className="performance-value">{performance.usersThisMonth.toLocaleString()}</p>
            <p className={`performance-change ${performance.usersChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.usersChange >= 0 ? '+' : ''}{performance.usersChange}%
            </p>
          </div>

          <div className="performance-card">
            <h3>New Products</h3>
            <p className="performance-value">{performance.productsThisMonth.toLocaleString()}</p>
            <p className={`performance-change ${performance.productsChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.productsChange >= 0 ? '+' : ''}{performance.productsChange}%
            </p>
          </div>

          <div className="performance-card">
            <h3>New Orders</h3>
            <p className="performance-value">{performance.ordersThisMonth.toLocaleString()}</p>
            <p className={`performance-change ${performance.ordersChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.ordersChange >= 0 ? '+' : ''}{performance.ordersChange}%
            </p>
          </div>

          <div className="performance-card">
            <h3>Monthly Revenue</h3>
            <p className="performance-value">${performance.revenueThisMonth.toLocaleString()}</p>
            <p className={`performance-change ${performance.revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {performance.revenueChange >= 0 ? '+' : ''}{performance.revenueChange}%
            </p>
          </div>
        </div>

        <div className="section-actions">
          <Link to="/admin/analytics" className="btn btn-outline">
            View Detailed Analytics
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/users" className="quick-action-card">
            <div className="action-icon">👥</div>
            <h3>User Management</h3>
            <p>Manage user accounts and roles</p>
          </Link>

          <Link to="/admin/products/pending" className="quick-action-card">
            <div className="action-icon">📦</div>
            <h3>Product Moderation</h3>
            <p>Approve or reject pending products</p>
          </Link>

          <Link to="/admin/orders" className="quick-action-card">
            <div className="action-icon">🛒</div>
            <h3>Order Management</h3>
            <p>View and manage all orders</p>
          </Link>

          <Link to="/admin/reviews/pending" className="quick-action-card">
            <div className="action-icon">⭐</div>
            <h3>Review Moderation</h3>
            <p>Approve or reject pending reviews</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;