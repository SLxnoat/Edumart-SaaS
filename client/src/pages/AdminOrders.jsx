import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  refundAdminOrder,
  exportAdminOrders,
} from '../api';
import '../components/AdminOrders.css';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminOrders({
        status: status !== 'all' ? status : undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
        search: search.trim() || undefined,
        sort,
        page,
        limit: 10,
      });
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to fetch platform orders');
    } finally {
      setLoading(false);
    }
  }, [status, paymentStatus, search, sort, page, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, orderNumber, newStatus) => {
    try {
      setActionInProgress(true);
      setError(null);
      await updateAdminOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (detailOrder && detailOrder.id === orderId) {
        setDetailOrder((prev) => ({ ...prev, status: newStatus }));
      }
      setFeedback(`Order #${orderNumber} marked as ${newStatus}`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleOpenDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      setError(null);
      const res = await getAdminOrderDetail(orderId);
      setDetailOrder(res.order);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenRefund = (order) => {
    setRefundOrder(order);
    setRefundAmount(order.totalAmount ? order.totalAmount.toFixed(2) : '');
    setRefundReason('Customer requested cancellation / return');
  };

  const handleConfirmRefund = async () => {
    if (!refundOrder) return;
    try {
      setActionInProgress(true);
      setError(null);
      await refundAdminOrder(refundOrder.id, parseFloat(refundAmount), refundReason);
      setFeedback(`Order #${refundOrder.orderNumber} refund processed`);
      setTimeout(() => setFeedback(null), 3500);
      setRefundOrder(null);
      if (detailOrder && detailOrder.id === refundOrder.id) {
        setDetailOrder(null);
      }
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Refund processing failed');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setActionInProgress(true);
      const res = await exportAdminOrders({
        status: status !== 'all' ? status : undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
      });

      if (!res.rows || res.rows.length === 0) {
        setFeedback('No orders available to export.');
        return;
      }

      // Convert rows to CSV
      const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Total Amount', 'Currency', 'Status', 'Payment Status', 'Date'];
      const csvContent = [
        headers.join(','),
        ...res.rows.map((r) =>
          [
            `"${r.orderNumber}"`,
            `"${r.customerName}"`,
            `"${r.customerEmail}"`,
            r.totalAmount,
            `"${r.currency}"`,
            `"${r.status}"`,
            `"${r.paymentStatus}"`,
            `"${new Date(r.date).toISOString()}"`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `edumart_orders_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFeedback(`Exported ${res.rows.length} order records`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to export orders');
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePrintSlip = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order.orderNumber} - Packing Slip</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #1e293b; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
            th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
            th { background: #f8fafc; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <h1>EduMart Order Slip</h1>
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${order.customer ? `${order.customer.name} (${order.customer.email})` : 'Guest'}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount?.toFixed(2)} ${order.currency || 'USD'}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          <p><strong>Fulfillment Status:</strong> ${order.status}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Format</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((it) => `
                <tr>
                  <td>${it.title}</td>
                  <td>${it.format}</td>
                  <td>${it.quantity}</td>
                  <td>$${it.unitPrice?.toFixed(2)}</td>
                  <td>$${it.totalPrice?.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page-shell admin-orders-container">
      <div className="admin-orders-header">
        <div>
          <Link to="/admin/dashboard" className="btn btn-link">← Back to Admin Dashboard</Link>
          <h1>Order Management</h1>
          <p className="admin-orders-subtitle">Monitor purchases, update fulfillment statuses, and manage customer refunds</p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-outline"
            disabled={actionInProgress}
            onClick={handleExportCSV}
          >
            📥 Export Orders (CSV)
          </button>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {feedback}
          <button className="btn btn-sm btn-link" onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="admin-orders-toolbar">
        <div className="admin-orders-search">
          <input
            type="text"
            placeholder="Search by order number, buyer name, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div>
          <select
            className="admin-orders-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="all">Fulfillment: All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <select
            className="admin-orders-select"
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
          >
            <option value="all">Payment: All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <select
            className="admin-orders-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="amount_high">Sort: Amount (High to Low)</option>
            <option value="amount_low">Sort: Amount (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading platform orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-orders-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No orders found</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
            No customer purchases matched the selected criteria.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => { setSearch(''); setStatus('all'); setPaymentStatus('all'); setPage(1); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="admin-orders-table-card">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.orderNumber}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {o.itemsCount} {o.itemsCount === 1 ? 'item' : 'items'}
                    </div>
                  </td>
                  <td>
                    <strong>{o.customer ? o.customer.name : 'Guest'}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {o.customer ? o.customer.email : 'No email'}
                    </div>
                  </td>
                  <td>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <strong>${o.totalAmount.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${(o.paymentStatus || 'pending').toLowerCase()}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select-pill"
                      value={o.status}
                      disabled={actionInProgress}
                      onChange={(e) => handleStatusChange(o.id, o.orderNumber, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleOpenDetail(o.id)}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        title="Print Packing Slip"
                        onClick={() => handlePrintSlip(o)}
                      >
                        Print Slip
                      </button>
                      {o.paymentStatus === 'paid' && o.status !== 'refunded' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => handleOpenRefund(o)}
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="admin-users-pagination">
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Showing page {page} of {totalPages} ({totalCount} total orders)
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>{page}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {(detailOrder || detailLoading) && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{detailOrder?.orderNumber}</h2>
              <button type="button" className="modal-close-btn" onClick={() => setDetailOrder(null)}>×</button>
            </div>

            {detailLoading ? (
              <p>Loading order details...</p>
            ) : detailOrder ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <span className={`badge badge-${(detailOrder.paymentStatus || 'pending').toLowerCase()}`}>
                      Payment: {detailOrder.paymentStatus}
                    </span>
                    <span style={{ marginLeft: '0.5rem' }} className={`badge badge-${(detailOrder.status || 'pending').toLowerCase()}`}>
                      Fulfillment: {detailOrder.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Placed: {new Date(detailOrder.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="user-detail-row">
                  <span className="user-detail-label">Customer:</span>
                  <span className="user-detail-val">
                    {detailOrder.customer ? `${detailOrder.customer.name} (${detailOrder.customer.email})` : 'Guest'}
                  </span>
                </div>

                {detailOrder.notes && (
                  <div className="user-detail-row">
                    <span className="user-detail-label">Order Notes:</span>
                    <span className="user-detail-val">{detailOrder.notes}</span>
                  </div>
                )}

                <h3 style={{ margin: '1.25rem 0 0.5rem', fontSize: '1.1rem' }}>Purchased Items</h3>
                <div>
                  {(detailOrder.items || []).map((it) => (
                    <div key={it.id} className="order-modal-item">
                      <div className="order-modal-item-info">
                        <strong>{it.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Format: {it.format} • Qty: {it.quantity} × ${it.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        ${it.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-summary-box">
                  <div className="order-summary-line">
                    <span>Subtotal</span>
                    <span>${detailOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {detailOrder.discountAmount > 0 && (
                    <div className="order-summary-line" style={{ color: '#16a34a' }}>
                      <span>Discount</span>
                      <span>-${detailOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {detailOrder.shippingCost > 0 && (
                    <div className="order-summary-line">
                      <span>Shipping</span>
                      <span>${detailOrder.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {detailOrder.taxAmount > 0 && (
                    <div className="order-summary-line">
                      <span>Tax</span>
                      <span>${detailOrder.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="order-summary-line total">
                    <span>Total Charged</span>
                    <span>${detailOrder.totalAmount.toFixed(2)} {detailOrder.currency}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => handlePrintSlip(detailOrder)}>
                    Print Slip
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setDetailOrder(null)}>
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundOrder && (
        <div className="modal-overlay" onClick={() => setRefundOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Issue Refund for Order #{refundOrder.orderNumber}</h2>
              <button type="button" className="modal-close-btn" onClick={() => setRefundOrder(null)}>×</button>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Original Total: <strong>${refundOrder.totalAmount?.toFixed(2)}</strong>.
              Enter refund amount and note reason.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="refundAmountInput" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Refund Amount (USD $) *
              </label>
              <input
                type="number"
                id="refundAmountInput"
                step="0.01"
                min="0.01"
                max={refundOrder.totalAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="refundReasonInput" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Reason for Refund *
              </label>
              <textarea
                id="refundReasonInput"
                rows="3"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setRefundOrder(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-reject"
                disabled={actionInProgress || !refundAmount || !refundReason.trim()}
                onClick={handleConfirmRefund}
              >
                {actionInProgress ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
