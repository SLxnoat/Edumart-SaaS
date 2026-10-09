import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch('/admin/stats', { credentials: 'include' });

        // For now, we'll simulate with placeholder data that matches expected structure
        // This data would normally come from the backend
        const mockData = {
          stats: {
            totalUsers: 12450,
            verifiedUsers: 9820,
            totalProducts: 3420,
            pendingProducts: 85,
            totalOrders: 8920,
            pendingOrders: 120,
            totalRevenue: 456780.50,
            monthlyGrowth: 12.5
          },
          recentActivity: [
            {
              id: 1,
              type: 'user',
              action: 'registered',
              user: 'Jane Smith',
              time: '2 minutes ago'
            },
            {
              id: 2,
              type: 'product',
              action: 'approved',
              product: 'Algebra 1 Past Papers Bundle',
              time: '5 minutes ago'
            },
            {
              id: 3,
              type: 'order',
              action: 'placed',
              user: 'Michael Chen',
              amount: 89.99,
              time: '8 minutes ago'
            },
            {
              id: 4,
              type: 'review',
              action: 'submitted',
              user: 'Sarah Johnson',
              product: 'Biology Revision Notes',
              time: '12 minutes ago'
            },
            {
              id: 5,
              type: 'user',
              action: 'role changed to admin',
              user: 'David Wilson',
              time: '20 minutes ago'
            }
          ],
          alerts: [
            {
              id: 1,
              type: 'warning',
              message: '5 products pending approval for more than 24 hours',
              time: 'Yesterday'
            },
            {
              id: 2,
              type: 'info',
              message: 'New feature release scheduled for next week',
              time: 'Today'
            }
          ],
          performance: {
            usersThisMonth: 1240,
            usersChange: 8.5,
            productsThisMonth: 85,
            productsChange: -2.1,
            ordersThisMonth: 420,
            ordersChange: 15.3,
            revenueThisMonth: 38420.00,
            revenueChange: 22.7
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

  const { stats, recentActivity, alerts, performance } = dashboardData;

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
            <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
            <p className="stat-label">Registered accounts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Verified Users</h3>
            <p className="stat-value">{stats.verifiedUsers.toLocaleString()}</p>
            <p className="stat-label">Email verified</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts.toLocaleString()}</p>
            <p className="stat-label">Active listings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Products</h3>
            <p className="stat-value">{stats.pendingProducts}</p>
            <p className="stat-label">Awaiting approval</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders.toLocaleString()}</p>
            <p className="stat-label">All time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
            <p className="stat-label">Awaiting processing</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
            <p className="stat-label">Platform earnings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Monthly Growth</h3>
            <p className="stat-value">{stats.monthlyGrowth}%</p>
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