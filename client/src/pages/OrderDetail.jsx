import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api';
import '../components/OrderDetail.css';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(orderId)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message || 'Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-shell">
        <div className="alert alert-error">{error || 'Order not found'}</div>
        <Link to="/orders" className="btn btn-outline">Back to Orders</Link>
      </div>
    );
  }

  const items = order.items || [];
  const payments = order.payments || [];

  return (
    <div className="page-shell order-detail-page">
      <div className="order-detail-header">
        <div>
          <Link to="/orders" className="btn btn-link">← All Orders</Link>
          <h1>Order {order.orderNumber}</h1>
          <p className="order-meta-info">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="order-status-group">
          <span className={`status-pill status-${order.status}`}>
            Status: {order.status?.toUpperCase()}
          </span>
          <span className={`status-pill status-${order.paymentStatus}`}>
            Payment: {order.paymentStatus?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-section">
          <h2>Items in this Order ({items.length})</h2>
          <ul className="order-items-table">
            {items.map((item) => (
              <li key={item.id} className="order-detail-item">
                <div className="item-main">
                  <Link
                    to={`/product/${item.materialId || item.material?.id}`}
                    className="item-name"
                  >
                    {item.material?.title || item.title || 'Learning Resource'}
                  </Link>
                  <span className="item-meta">
                    Format: {item.material?.format || 'Digital'} | SKU: {item.material?.sku || 'N/A'}
                  </span>
                </div>
                <div className="item-cost">
                  <span>{item.quantity} × {money(item.unitPrice)}</span>
                  <strong>{money(item.totalPrice || item.unitPrice * item.quantity)}</strong>
                </div>
              </li>
            ))}
          </ul>

          <div className="order-summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>{money(order.subtotal)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="summary-line discount">
                <span>Coupon Discount:</span>
                <span>-{money(order.discountAmount)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Shipping Cost:</span>
              <span>{Number(order.shippingCost) === 0 ? 'FREE' : money(order.shippingCost)}</span>
            </div>
            <div className="summary-line">
              <span>Estimated Tax (10%):</span>
              <span>{money(order.taxAmount)}</span>
            </div>
            <div className="summary-line total-line">
              <span>Grand Total:</span>
              <span>{money(order.totalAmount)} {order.currency}</span>
            </div>
          </div>
        </div>

        <div className="order-side-info">
          {order.shippingAddress && (
            <div className="info-card">
              <h3>Shipping Information</h3>
              <p><strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong></p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          )}

          <div className="info-card">
            <h3>Transaction History</h3>
            {payments.length === 0 ? (
              <p className="text-muted">No external payment records found.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="payment-entry">
                  <div><strong>Method:</strong> {p.paymentMethod}</div>
                  <div><strong>Ref:</strong> {p.gatewayReference}</div>
                  <div><strong>Status:</strong> {p.status?.toUpperCase()}</div>
                  <div><strong>Paid:</strong> {new Date(p.paidAt || p.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>

          <div className="info-card help-card">
            <h3>Need Help?</h3>
            <p>Have questions about your order or download access?</p>
            <Link to="/catalog" className="btn btn-sm btn-outline">Explore More Study Materials</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
