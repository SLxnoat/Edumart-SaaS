import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileResponse = await fetch('/api/auth/profile', {
          credentials: 'include',
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();

        if (!profileData.success) {
          throw new Error(profileData.message || 'Failed to fetch profile');
        }

        setUser(profileData.user);
        setFormData({
          firstName: profileData.user.firstName || '',
          lastName: profileData.user.lastName || '',
          email: profileData.user.email || '',
        });

        // Fetch user orders
        const ordersResponse = await fetch('/api/orders', {
          credentials: 'include',
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
        } else {
          // If orders fetch fails, we still continue with profile data
          console.warn('Failed to fetch orders');
          setOrders([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
        // Redirect to login if not authenticated
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setUser(prev => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }));

      // Reset editing state after successful update
      setTimeout(() => {
        setIsEditing(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user data is not available (e.g., not logged in), redirect to login
  if (!user) {
    return null; // The useEffect will handle redirection
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>My Profile</h1>
        </div>
        <div className="profile-content">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>My Profile</h1>
        </div>
        <div className="profile-content">
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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>My Profile</h1>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
          <button className="btn btn-sm btn-link" onClick={() => setSuccess(null)}>
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders ({orders.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' ? (
          <>
            {!isEditing ? (
              // View mode
              <div className="profile-view">
                <div className="profile-info">
                  <div className="profile-item">
                    <span className="profile-label">First Name:</span>
                    <span className="profile-value">{user.firstName}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Last Name:</span>
                    <span className="profile-value">{user.lastName}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Email:</span>
                    <span className="profile-value">{user.email}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Role:</span>
                    <span className="profile-value">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Account Status:</span>
                    <span className="profile-value">
                      {user.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Member Since:</span>
                    <span className="profile-value">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                  <Link to="/" className="btn btn-link">
                    Cancel
                  </Link>
                </div>
              </div>
            ) : (
              // Edit mode
              <div className="profile-edit">
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving changes...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Recent Activity Section */}
            <div className="profile-section">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {/* Mock activity data - in a real app this would come from API */}
                <div className="activity-item">
                  <div className="activity-icon">📦</div>
                  <div className="activity-details">
                    <p className="activity-text">
                      Placed order #ORD-001234
                    </p>
                    <p className="activity-time">2 days ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">💬</div>
                  <div className="activity-details">
                    <p className="activity-text">
                      Left a review on "Algebra 1 Past Papers Bundle"
                    </p>
                    <p className="activity-time">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Orders tab
          <div className="orders-section">
            <h2>My Orders</h2>

            {orders.length > 0 ? (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>{order.itemsCount} items</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${order.status.toLowerCase()}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="order-actions">
                            <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline">
                              View Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p className="empty-state-title">You haven't placed any orders yet</p>
                <p className="empty-state-description">
                  Start shopping to see your order history here.
                </p>
                <Link to="/catalog" className="btn btn-outline">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;