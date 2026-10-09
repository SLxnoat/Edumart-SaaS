import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch('/notifications', { credentials: 'include' });

        // For now, we'll simulate with placeholder data that matches expected structure
        // This data would normally come from the backend
        const mockNotifications = [
          {
            id: 1,
            type: 'order',
            message: 'Your order #ORD-001234 has been shipped',
            isRead: false,
            time: '2 minutes ago',
            action: {
              text: 'Track Order',
              url: '/orders/ORD-001234'
            }
          },
          {
            id: 2,
            type: 'message',
            message: 'You have a new message from Jane Smith',
            isRead: true,
            time: '15 minutes ago',
            action: {
              text: 'View Message',
              url: '/messages/1'
            }
          },
          {
            id: 3,
            type: 'promotion',
            message: 'Summer sale! 20% off all study materials',
            isRead: false,
            time: '1 hour ago',
            action: {
              text: 'Shop Sale',
              url: '/catalog?sale=summer20'
            }
          },
          {
            id: 4,
            type: 'system',
            message: 'Scheduled maintenance tonight from 2-4 AM EST',
            isRead: false,
            time: '3 hours ago',
            action: {
              text: 'Learn More',
              url: '/maintenance'
            }
          },
          {
            id: 5,
            type: 'review',
            message: 'New review on your product "Algebra 1 Past Papers Bundle"',
            isRead: true,
            time: '5 hours ago',
            action: {
              text: 'View Review',
              url: '/reviews/product/PROD-001'
            }
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setNotifications(mockNotifications);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load notifications');
        setLoading(false);
        // Redirect to login if not authenticated
        navigate('/login');
      }
    };

    fetchNotifications();
  }, [navigate]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // In a real implementation, this would call an API like:
      // await fetch(`/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });

      // For now, update optimistically
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Optionally show a toast or revert the optimistic update
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      // In a real implementation, this would call an API like:
      // await fetch(`/notifications/${id}`, { method: 'DELETE', credentials: 'include' });

      // For now, remove from state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      // Optionally show a toast or revert the optimistic update
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // In a real implementation, this would call an API like:
      // await fetch('/notifications/read-all', { method: 'PUT', credentials: 'include' });

      // For now, update optimistically
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="notifications-loading">
          <div className="notifications-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>Notifications</h1>
          </div>
          <div className="notifications-content">
            <div className="loading-spinner"></div>
            <p>Loading your notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="notifications-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Notifications</h1>
        </div>
        <div className="notifications-content">
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

  // If no notifications
  if (notifications.length === 0) {
    return (
      <div className="page-shell">
        <div className="notifications-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Notifications</h1>
          <p className="notifications-subtitle">Stay updated with your EduMart activity</p>
        </div>
        <div className="notifications-content">
          <div className="empty-state">
            <div className="empty-state-icon">🔕</div>
            <p className="empty-state-title">No notifications</p>
            <p className="empty-state-description">
              You don't have any notifications yet. You'll see updates here when you have new messages, order updates, or promotional offers.
            </p>
            <Link to="/" className="btn btn-outline">
              Go Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-shell">
      <div className="notifications-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <span className="notification-count-badge">{unreadCount}</span>
        )}
        <p className="notifications-subtitle">Stay updated with your EduMart activity</p>
      </div>

      {/* Actions Bar */}
      <div className="notifications-actions">
        <button
          className="btn btn-outline"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
        <Link to="/notifications/settings" className="btn btn-link">
          Notification settings
        </Link>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
            <div className="notification-content">
              <div className="notification-icon">
                {notification.type === 'order' ? '📦' :
                 notification.type === 'message' ? '💬' :
                 notification.type === 'promotion' ? '🏷️' :
                 notification.type === 'system' ? '⚙️' :
                 notification.type === 'review' ? '⭐' : '🔔'}
              </div>
              <div className="notification-details">
                <p className="notification-message">{notification.message}</p>
                {notification.action && (
                  <Link
                    to={notification.action.url}
                    className="notification-action"
                  >
                    {notification.action.text}
                  </Link>
                )}
              </div>
              <div className="notification-time">{notification.time}</div>
            </div>
            <div className="notification-actions">
              {!notification.isRead && (
                <button
                  className="btn btn-sm btn-link"
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as read
                </button>
              )}
              <button
                className="btn btn-sm btn-link"
                onClick={() => deleteNotification(notification.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;