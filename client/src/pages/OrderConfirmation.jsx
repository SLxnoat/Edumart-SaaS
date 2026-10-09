import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api';
import '../components/OrderConfirmation.css';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(orderId)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="loading-spinner"></div>
        <p>Retrieving your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-shell">
        <div className="alert alert-error">{error || 'Unable to display order'}</div>
        <Link to="/catalog" className="btn btn-outline">Back to Catalog</Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="page-shell confirmation-page">
      <div className="confirmation-banner">
        <div className="check-icon">✓</div>
        <h1>Thank you for your order!</h1>
        <p className="order-num-tag">Order Number: <strong>{order.orderNumber}</strong></p>
        <p className="order-sub">
          A confirmation receipt has been sent to your email. You can download and access your learning materials below.
        </p>
      </div>

      <div className="confirmation-grid">
        <div className="order-card">
          <h2>Order Summary</h2>
          <ul className="order-item-list">
            {items.map((i) => (
              <li key={i.id} className="order-item-row">
                <div>
                  <div className="order-item-title">{i.material?.title || i.title || 'Learning Resource'}</div>
                  <div className="order-item-sub">Qty: {i.quantity} | {i.material?.format || 'Digital'}</div>
                </div>
                <div className="order-item-price">{money(i.totalPrice || (i.unitPrice * i.quantity))}</div>
              </li>
            ))}
          </ul>

          <div className="order-breakdown">
            <div><span>Subtotal:</span> <span>{money(order.subtotal)}</span></div>
            {Number(order.discountAmount) > 0 && (
              <div className="discount-txt"><span>Discount:</span> <span>-{money(order.discountAmount)}</span></div>
            )}
            <div><span>Shipping:</span> <span>{Number(order.shippingCost) === 0 ? 'Free' : money(order.shippingCost)}</span></div>
            <div><span>Tax:</span> <span>{money(order.taxAmount)}</span></div>
            <div className="order-total-row"><span>Total Paid:</span> <span>{money(order.totalAmount)}</span></div>
          </div>
        </div>

        <div className="order-card">
          <h2>Order & Delivery Status</h2>
          <div className="status-badge-row">
            <span>Payment Status:</span>
            <span className="badge badge-success">{order.paymentStatus?.toUpperCase()}</span>
          </div>
          <div className="status-badge-row">
            <span>Fulfillment:</span>
            <span className="badge badge-info">{order.status?.toUpperCase()}</span>
          </div>

          {order.shippingAddress && (
            <div className="shipping-details">
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
            </div>
          )}

          <div className="confirm-actions">
            <Link to="/catalog" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/profile" className="btn btn-outline">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
