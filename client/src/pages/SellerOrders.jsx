import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerOrders } from '../api';
import '../components/SellerPages.css';

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getSellerOrders();
        setOrders(res.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch seller orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return (o.orderStatus || '').toLowerCase() === statusFilter || (o.paymentStatus || '').toLowerCase() === statusFilter;
  });

  return (
    <div className="page-shell seller-page-container">
      <div className="seller-page-header">
        <div>
          <Link to="/seller/dashboard" className="btn btn-link">← Back to Dashboard</Link>
          <h1>Seller Orders</h1>
          <p className="seller-page-subtitle">Track purchases, buyer information, and fulfillment status for your materials</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="seller-toolbar">
        <div>
          <strong>Total Orders Received:</strong> {orders.length}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="orderStatusFilter" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Filter Status:</label>
          <select
            id="orderStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="all">All Orders</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading customer orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="seller-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No orders found</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
            {orders.length === 0
              ? 'You have not received any orders for your materials yet.'
              : 'No orders match the selected filter.'}
          </p>
          <Link to="/seller/dashboard" className="btn btn-outline">Back to Dashboard</Link>
        </div>
      ) : (
        <div className="seller-table-card">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.orderItemId || o.orderId}>
                  <td>
                    <strong>{o.orderNumber || `#${o.orderId?.slice(0, 8)}`}</strong>
                  </td>
                  <td>
                    <strong>{o.productTitle}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Format: {o.format}</div>
                  </td>
                  <td>
                    <div>{o.customerName || 'Customer'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.customerEmail}</div>
                  </td>
                  <td>{o.quantity}</td>
                  <td>
                    <strong>${Number(o.totalPrice || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${(o.paymentStatus || 'pending').toLowerCase()}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${(o.orderStatus || 'pending').toLowerCase()}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td>
                    {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
