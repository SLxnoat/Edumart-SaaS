import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminUsers,
  getAdminUser,
  updateUserRole,
  toggleUserVerification,
  deleteAdminUser,
  impersonateUser,
  setToken,
} from '../api';
import '../components/AdminUsers.css';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: role !== 'all' ? role : undefined,
        status: status !== 'all' ? status : undefined,
        sort,
      });
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to fetch user list');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status, sort, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError(null);
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setFeedback(`User role successfully updated to ${newRole}`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleToggleVerify = async (userId) => {
    try {
      setError(null);
      const res = await toggleUserVerification(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: res.isVerified } : u))
      );
      setFeedback(`User verification status updated to ${res.isVerified ? 'Verified' : 'Unverified'}`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to toggle verification');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${userEmail}?`)) {
      return;
    }
    try {
      setError(null);
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setFeedback(`User ${userEmail} was deleted`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleImpersonate = async (userId, userName) => {
    if (!window.confirm(`Start impersonation session as "${userName}"? This will switch your active session.`)) {
      return;
    }
    try {
      setError(null);
      const res = await impersonateUser(userId);
      if (res.token) {
        setToken(res.token);
        setFeedback(`Now impersonating ${userName}. Redirecting to homepage...`);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to impersonate user');
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      setModalLoading(true);
      setError(null);
      const res = await getAdminUser(userId);
      setSelectedUser(res);
    } catch (err) {
      setError(err.message || 'Failed to load user profile details');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page-shell admin-users-container">
      <div className="admin-users-header">
        <div>
          <Link to="/admin/dashboard" className="btn btn-link">← Back to Dashboard</Link>
          <h1>User Management</h1>
          <p className="admin-users-subtitle">Review registered students, tutors, and administrators</p>
        </div>
        <div style={{ color: '#64748b', fontWeight: 600 }}>
          Total Accounts: {totalCount}
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

      {/* Filter and Search Bar */}
      <div className="admin-users-filters">
        <div className="admin-users-search">
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div>
          <select
            className="admin-users-select"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div>
          <select
            className="admin-users-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Email</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <div>
          <select
            className="admin-users-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading user directory...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-users-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No users found</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
            No accounts matched your search and filter criteria.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setSearch('');
              setRole('all');
              setStatus('all');
              setPage(1);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="admin-users-table-card">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Registered</th>
                <th>Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.firstName} {u.lastName}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{u.email}</div>
                  </td>
                  <td>
                    <select
                      className={`badge-role badge-role-${u.role}`}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={u.isVerified ? 'badge-verified' : 'badge-unverified'}
                      style={{ border: 'none', cursor: 'pointer' }}
                      title="Click to toggle verification status"
                      onClick={() => handleToggleVerify(u.id)}
                    >
                      {u.isVerified ? '✓ Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleViewDetails(u.id)}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ color: '#2563eb', borderColor: '#93c5fd' }}
                        title="Impersonate user for support"
                        onClick={() => handleImpersonate(u.id, `${u.firstName} ${u.lastName}`)}
                      >
                        Impersonate
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleDeleteUser(u.id, u.email)}
                      >
                        Delete
                      </button>
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
            Showing page {page} of {totalPages} ({totalCount} total users)
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

      {/* Detail Modal */}
      {(selectedUser || modalLoading) && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Account Overview</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            {modalLoading ? (
              <p>Loading profile details...</p>
            ) : selectedUser ? (
              <div>
                <div className="user-detail-row">
                  <span className="user-detail-label">User ID:</span>
                  <span className="user-detail-val" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {selectedUser.user.id}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Full Name:</span>
                  <span className="user-detail-val">
                    {selectedUser.user.firstName} {selectedUser.user.lastName}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Email:</span>
                  <span className="user-detail-val">{selectedUser.user.email}</span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Role:</span>
                  <span className="user-detail-val" style={{ textTransform: 'capitalize' }}>
                    {selectedUser.user.role}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Email Verification:</span>
                  <span className="user-detail-val">
                    {selectedUser.user.isVerified ? 'Verified' : 'Pending / Unverified'}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Joined Date:</span>
                  <span className="user-detail-val">
                    {new Date(selectedUser.user.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Orders Placed:</span>
                  <span className="user-detail-val">{selectedUser.stats?.ordersCount || 0}</span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">Materials Listed:</span>
                  <span className="user-detail-val">{selectedUser.stats?.materialsCount || 0}</span>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
