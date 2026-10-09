import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProducts, toggleProductStatus, deleteSellerProduct } from '../api';
import '../components/SellerPages.css';

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSellerProducts();
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await toggleProductStatus(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: res.isActive } : p))
      );
      setActionMessage('Product visibility updated');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update product status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteSellerProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setActionMessage('Product deleted successfully');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'active') return p.isActive;
    if (filterStatus === 'inactive') return !p.isActive;
    return true;
  });

  return (
    <div className="page-shell seller-page-container">
      <div className="seller-page-header">
        <div>
          <Link to="/seller/dashboard" className="btn btn-link">← Back to Dashboard</Link>
          <h1>Product Management</h1>
          <p className="seller-page-subtitle">Manage your listed study resources, pricing, and availability</p>
        </div>
        <div>
          <Link to="/seller/upload" className="btn btn-primary">+ Upload New Material</Link>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="seller-toolbar">
        <div className="seller-toolbar-search">
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="filterStatus" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="all">All Products ({products.length})</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading your catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="seller-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No products found</h3>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
            {searchTerm ? 'No results matched your search criteria.' : 'You haven\'t listed any learning materials yet.'}
          </p>
          <Link to="/seller/upload" className="btn btn-primary">Upload First Material</Link>
        </div>
      ) : (
        <div className="seller-table-card">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject & Grade</th>
                <th>Format</th>
                <th>Price</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Category: {item.category}</div>
                  </td>
                  <td>
                    {item.subject} • {item.gradeLevel}
                  </td>
                  <td>
                    <span className="badge badge-format">{item.format}</span>
                  </td>
                  <td>
                    <strong>${item.price.toFixed(2)}</strong>
                  </td>
                  <td>👁️ {item.views || 0}</td>
                  <td>
                    <span className={`badge ${item.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => handleToggle(item.id)}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleDelete(item.id)}
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
    </div>
  );
};

export default SellerProductsPage;
