import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory } from '../api';
import '../components/OrderHistory.css';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getOrderHistory()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message || 'Failed to load orders. Please log in.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  if (loading) {
    return (
      <div className="page-shell">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="page-shell order-history-page">
      <div className="order-history-header">
        <div>
          <Link to="/profile" className="btn btn-link">← Back to Profile</Link>
          <h1>My Order History</h1>
          <p className="subtitle">View and manage your previous learning material orders</p>
        </div>

        <div className="order-filter-bar">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          {error.includes('log in') && (
            <Link to="/login" className="btn btn-sm btn-outline ml-2">Log In</Link>
          )}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-title">No orders found</p>
          <p className="empty-state-description">
            {statusFilter
              ? `You have no orders with status "${statusFilter}".`
              : "You haven't placed any orders yet."}
          </p>
          <Link to="/catalog" className="btn btn-outline">Explore Materials</Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const items = order.items || [];
            return (
              <div key={order.id} className="order-history-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-number-title">{order.orderNumber}</span>
                    <span className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-header-right">
                    <span className={`status-tag status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="order-amount-pill">{money(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview">
                    {items.map((item) => (
                      <div key={item.id} className="order-item-inline">
                        <span className="item-title">
                          {item.material?.title || item.title || 'Educational Material'}
                        </span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                        <span className="item-price">{money(item.totalPrice || item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-actions">
                    <Link to={`/orders/${order.orderNumber || order.id}`} className="btn btn-sm btn-primary">
                      View Order Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
