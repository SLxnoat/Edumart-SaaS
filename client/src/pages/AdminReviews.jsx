import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  deleteAdminReview,
  respondAdminReview,
  bulkModerateReviews,
} from '../api';
import '../components/AdminReviews.css';

const AdminReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [tab, setTab] = useState('pending');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Response Modal
  const [responseReview, setResponseReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminReviews({
        status: tab !== 'all' ? tab : undefined,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        search: search.trim() || undefined,
        sort,
        page,
        limit: 10,
      });
      setReviews(res.reviews || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
      if (res.stats) setStats(res.stats);
      setSelectedIds([]);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [tab, ratingFilter, search, sort, page, navigate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      setActionInProgress(true);
      setError(null);
      await approveAdminReview(id);
      setFeedback('Review approved and published');
      setTimeout(() => setFeedback(null), 3500);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to approve review');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionInProgress(true);
      setError(null);
      await rejectAdminReview(id);
      setFeedback('Review rejected / marked unapproved');
      setTimeout(() => setFeedback(null), 3500);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to reject review');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      setActionInProgress(true);
      setError(null);
      await deleteAdminReview(id);
      setFeedback('Review deleted permanently');
      setTimeout(() => setFeedback(null), 3500);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleOpenResponse = (review) => {
    setResponseReview(review);
    setResponseText(`Thank you for your feedback regarding "${review.material?.title || 'this resource'}".`);
  };

  const handleConfirmResponse = async () => {
    if (!responseReview || !responseText.trim()) return;
    try {
      setActionInProgress(true);
      setError(null);
      await respondAdminReview(responseReview.id, responseText.trim());
      setFeedback('Official response sent to reviewer');
      setTimeout(() => setFeedback(null), 3500);
      setResponseReview(null);
    } catch (err) {
      setError(err.message || 'Failed to send response');
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
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} ${selectedIds.length} selected reviews?`)) return;

    try {
      setActionInProgress(true);
      setError(null);
      await bulkModerateReviews(selectedIds, action);
      setFeedback(`Bulk action "${action}" completed for ${selectedIds.length} reviews`);
      setTimeout(() => setFeedback(null), 3500);
      fetchReviews();
    } catch (err) {
      setError(err.message || `Bulk ${action} failed`);
    } finally {
      setActionInProgress(false);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));
  };

  return (
    <div className="page-shell admin-reviews-container">
      <div className="admin-reviews-header">
        <div>
          <Link to="/admin/dashboard" className="btn btn-link">← Back to Admin Dashboard</Link>
          <h1>Review Moderation Tools</h1>
          <p className="admin-reviews-subtitle">Evaluate buyer ratings and feedback, verify reviews, and publish official responses</p>
        </div>
        <div style={{ color: '#64748b', fontWeight: 600 }}>
          Pending Approval: {stats.pending} | Published: {stats.approved}
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
          Pending Review ({stats.pending})
        </button>
        <button
          type="button"
          className={`moderation-tab-btn ${tab === 'approved' ? 'active' : ''}`}
          onClick={() => { setTab('approved'); setPage(1); }}
        >
          Published & Approved ({stats.approved})
        </button>
        <button
          type="button"
          className={`moderation-tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => { setTab('all'); setPage(1); }}
        >
          All Reviews ({stats.total})
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="admin-reviews-toolbar">
        <div className="admin-reviews-search">
          <input
            type="text"
            placeholder="Search comment, material, or reviewer name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div>
          <select
            className="admin-reviews-select"
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Rating: All Stars</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>

        <div>
          <select
            className="admin-reviews-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="rating_high">Sort: Highest Rating</option>
            <option value="rating_low">Sort: Lowest Rating</option>
          </select>
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
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              disabled={actionInProgress}
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading customer reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="moderation-card" style={{ display: 'block', textAlign: 'center', padding: '3rem' }}>
          <h3>No reviews found</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1rem' }}>
            {tab === 'pending'
              ? 'No customer reviews are currently waiting for moderation.'
              : 'No reviews matched your filters.'}
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => { setSearch(''); setRatingFilter('all'); setTab('all'); setPage(1); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="selectAllReviews"
              checked={selectedIds.length === reviews.length && reviews.length > 0}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAllReviews" style={{ fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>
              Select All on this page
            </label>
          </div>

          {reviews.map((r) => (
            <div key={r.id} className="review-moderation-card">
              <div className="moderation-check">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => handleToggleSelect(r.id)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="review-stars" title={`${r.rating} out of 5 stars`}>
                    {renderStars(r.rating)} <span style={{ color: '#475569', fontSize: '0.9rem' }}>({r.rating}/5)</span>
                  </div>
                  <span className={`badge ${r.isApproved ? 'badge-active' : 'badge-pending'}`}>
                    {r.isApproved ? 'Approved' : 'Pending Moderation'}
                  </span>
                </div>

                <h3 style={{ margin: '0.25rem 0', fontSize: '1.15rem' }}>{r.title}</h3>
                <div className="review-comment-box">
                  {r.comment || <em>No written comment provided.</em>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="review-material-badge">
                    <span>📚 Material: {r.material?.title || 'Unknown Resource'}</span>
                    {r.material?.subject && <span>• {r.material.subject}</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    👤 <strong>{r.user?.name || 'Customer'}</strong> ({r.user?.email || 'N/A'}) • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="review-actions">
                {!r.isApproved ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-approve"
                    disabled={actionInProgress}
                    onClick={() => handleApprove(r.id)}
                  >
                    ✓ Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-reject"
                    disabled={actionInProgress}
                    onClick={() => handleReject(r.id)}
                  >
                    Unapprove
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => handleOpenResponse(r)}
                >
                  💬 Official Reply
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  disabled={actionInProgress}
                  onClick={() => handleDelete(r.id)}
                >
                  Delete
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
            Showing page {page} of {totalPages} ({totalCount} total reviews)
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

      {/* Official Response Modal */}
      {responseReview && (
        <div className="modal-overlay" onClick={() => setResponseReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Official Admin Reply</h2>
              <button type="button" className="modal-close-btn" onClick={() => setResponseReview(null)}>×</button>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Composing reply to <strong>{responseReview.user?.name}</strong> for review on <strong>&ldquo;{responseReview.material?.title}&rdquo;</strong>.
              This response will be delivered to the reviewer&apos;s notification inbox.
            </p>
            <textarea
              className="reason-textarea"
              rows="4"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response to the customer..."
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setResponseReview(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={actionInProgress || !responseText.trim()}
                onClick={handleConfirmResponse}
              >
                {actionInProgress ? 'Sending...' : 'Send Official Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
