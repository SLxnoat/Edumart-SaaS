import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getModerationQueue,
  approveModerationProduct,
  rejectModerationProduct,
  bulkModerateProducts,
} from '../api';
import '../components/AdminModeration.css';

const AdminModerationQueue = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters & Tabs
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [rejectModalProduct, setRejectModalProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewProduct, setPreviewProduct] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getModerationQueue({
        status: tab,
        search: search.trim() || undefined,
        page,
        limit: 10,
      });
      setProducts(res.products || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
      setSelectedIds([]);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to fetch moderation queue');
    } finally {
      setLoading(false);
    }
  }, [tab, search, page, navigate]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleApprove = async (id, title) => {
    try {
      setActionInProgress(true);
      setError(null);
      await approveModerationProduct(id);
      setFeedback(`"${title}" was approved and is now live`);
      setTimeout(() => setFeedback(null), 3500);
      fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to approve product');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleOpenReject = (product) => {
    setRejectModalProduct(product);
    setRejectReason('Content does not meet marketplace standards or syllabus requirements');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalProduct) return;
    try {
      setActionInProgress(true);
      setError(null);
      await rejectModerationProduct(rejectModalProduct.id, rejectReason);
      setFeedback(`"${rejectModalProduct.title}" was rejected with feedback sent to seller`);
      setTimeout(() => setFeedback(null), 3500);
      setRejectModalProduct(null);
      fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to reject product');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    const confirmMsg = `Are you sure you want to ${action} ${selectedIds.length} selected items?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionInProgress(true);
      setError(null);
      await bulkModerateProducts(selectedIds, action, 'Bulk moderation by admin');
      setFeedback(`Successfully ${action}d ${selectedIds.length} materials`);
      setTimeout(() => setFeedback(null), 3500);
      fetchQueue();
    } catch (err) {
      setError(err.message || `Bulk ${action} failed`);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="page-shell moderation-container">
      <div className="moderation-header">
        <div>
          <Link to="/admin/dashboard" className="btn btn-link">← Back to Admin Dashboard</Link>
          <h1>Product Moderation Queue</h1>
          <p className="moderation-subtitle">Review, approve, or reject user-submitted educational materials</p>
        </div>
        <div style={{ color: '#64748b', fontWeight: 600 }}>
          Queue Items: {totalCount}
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

      {/* Tabs */}
      <div className="moderation-tabs">
        <button
          type="button"
          className={`moderation-tab-btn ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => { setTab('pending'); setPage(1); }}
        >
          Pending Review ({tab === 'pending' ? totalCount : '...'})
        </button>
        <button
          type="button"
          className={`moderation-tab-btn ${tab === 'approved' ? 'active' : ''}`}
          onClick={() => { setTab('approved'); setPage(1); }}
        >
          Approved & Active
        </button>
        <button
          type="button"
          className={`moderation-tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => { setTab('all'); setPage(1); }}
        >
          All Listings
        </button>
      </div>

      {/* Toolbar */}
      <div className="moderation-toolbar">
        <div className="moderation-search">
          <input
            type="text"
            placeholder="Search by title, subject, or grade..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {selectedIds.length} Selected
            </span>
            <button
              type="button"
              className="btn btn-sm btn-approve"
              disabled={actionInProgress}
              onClick={() => handleBulkAction('approve')}
            >
              Approve All
            </button>
            <button
              type="button"
              className="btn btn-sm btn-reject"
              disabled={actionInProgress}
              onClick={() => handleBulkAction('reject')}
            >
              Reject All
            </button>
          </div>
        )}
      </div>

      {/* Products List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading moderation queue...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="moderation-card" style={{ display: 'block', textAlign: 'center', padding: '3rem' }}>
          <h3>No materials in this queue</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1rem' }}>
            {tab === 'pending'
              ? 'Great job! There are no educational materials awaiting moderation.'
              : 'No items match your filter.'}
          </p>
          <Link to="/admin/dashboard" className="btn btn-outline">Back to Dashboard</Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="selectAllBox"
              checked={selectedIds.length === products.length && products.length > 0}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAllBox" style={{ fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>
              Select All on this page
            </label>
          </div>

          {products.map((item) => (
            <div key={item.id} className="moderation-card">
              <div className="moderation-check">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                />
              </div>

              <div className="moderation-details">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span className={`badge ${item.isApproved ? 'badge-active' : 'badge-pending'}`}>
                    {item.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                  <span className="badge badge-format">{item.format}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Submitted: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3>{item.title}</h3>
                <div className="moderation-meta">
                  <span><strong>Subject:</strong> {item.subject}</span>
                  <span><strong>Grade:</strong> {item.gradeLevel}</span>
                  {item.examYear && <span><strong>Year:</strong> {item.examYear}</span>}
                  <span><strong>Price:</strong> ${item.price.toFixed(2)}</span>
                  <span><strong>Category:</strong> {item.category}</span>
                </div>

                <div className="moderation-seller-info">
                  <span>👤 Seller: {item.seller?.name || 'Unknown'} ({item.seller?.email || 'N/A'})</span>
                </div>
              </div>

              <div className="moderation-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setPreviewProduct(item)}
                >
                  Preview Details
                </button>
                {!item.isApproved ? (
                  <button
                    type="button"
                    className="btn btn-approve"
                    disabled={actionInProgress}
                    onClick={() => handleApprove(item.id, item.title)}
                  >
                    ✓ Approve
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-reject"
                  disabled={actionInProgress}
                  onClick={() => handleOpenReject(item)}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="admin-users-pagination" style={{ marginTop: '2rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Showing page {page} of {totalPages} ({totalCount} total items)
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

      {/* Rejection Modal */}
      {rejectModalProduct && (
        <div className="modal-overlay" onClick={() => setRejectModalProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Submission</h2>
              <button type="button" className="modal-close-btn" onClick={() => setRejectModalProduct(null)}>×</button>
            </div>
            <p>
              Provide feedback or rejection reason for <strong>&ldquo;{rejectModalProduct.title}&rdquo;</strong>.
              This explanation will be delivered directly to the seller.
            </p>
            <textarea
              className="reason-textarea"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please upload sample pages or higher resolution cover..."
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setRejectModalProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-reject"
                disabled={actionInProgress || !rejectReason.trim()}
                onClick={handleConfirmReject}
              >
                {actionInProgress ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProduct && (
        <div className="modal-overlay" onClick={() => setPreviewProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Material Preview</h2>
              <button type="button" className="modal-close-btn" onClick={() => setPreviewProduct(null)}>×</button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge badge-format">{previewProduct.format}</span>
              <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#1e293b' }}>
                ${previewProduct.price.toFixed(2)}
              </span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem' }}>{previewProduct.title}</h3>
            {previewProduct.shortDescription && (
              <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>
                {previewProduct.shortDescription}
              </p>
            )}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
              {previewProduct.description}
            </div>
            <div className="user-detail-row">
              <span className="user-detail-label">Subject & Grade:</span>
              <span className="user-detail-val">{previewProduct.subject} • {previewProduct.gradeLevel}</span>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-label">Seller:</span>
              <span className="user-detail-val">{previewProduct.seller?.name} ({previewProduct.seller?.email})</span>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-label">Product Type:</span>
              <span className="user-detail-val">{previewProduct.productType}</span>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPreviewProduct(null)}>
                Close
              </button>
              {!previewProduct.isApproved && (
                <button
                  type="button"
                  className="btn btn-approve"
                  onClick={() => {
                    handleApprove(previewProduct.id, previewProduct.title);
                    setPreviewProduct(null);
                  }}
                >
                  Approve Submission
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModerationQueue;
