import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { broadcastAdminNotification, getAdminCampaigns } from '../api';
import '../components/AdminNotifications.css';

export default function AdminNotifications() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalCampaigns: 0, totalRecipientsReached: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [type, setType] = useState('promotion');
  const [sendEmail, setSendEmail] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await getAdminCampaigns();
      if (res && res.success) {
        setCampaigns(res.campaigns || []);
        setStats(res.stats || { totalCampaigns: 0, totalRecipientsReached: 0 });
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Please enter both title and notification body.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: '', message: '' });
      const res = await broadcastAdminNotification({
        title,
        message,
        targetAudience,
        type,
        sendEmail,
      });

      if (res && res.success) {
        setFeedback({
          type: 'success',
          message: `Campaign broadcasted successfully to ${res.recipientCount} users!`,
        });
        setTitle('');
        setMessage('');
        fetchCampaigns();
      } else {
        setFeedback({
          type: 'error',
          message: res?.message || 'Failed to dispatch notification broadcast.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Server error broadcasting notification.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-notifs-container">
      <div className="admin-notifs-header">
        <div>
          <Link to="/admin" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            &larr; Back to Admin Dashboard
          </Link>
          <h1>Campaign &amp; Notification Manager</h1>
          <p className="admin-notifs-subtitle">
            Compose and broadcast targeted announcements, updates, and marketing campaigns to EduMart users.
          </p>
        </div>
      </div>

      <div className="admin-notifs-stats">
        <div className="notif-stat-card">
          <div className="notif-stat-label">Total Campaigns Dispatched</div>
          <div className="notif-stat-value">{stats.totalCampaigns}</div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-label">Total Notifications Delivered</div>
          <div className="notif-stat-value">{stats.totalRecipientsReached}</div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-label">Delivery Channel</div>
          <div className="notif-stat-value" style={{ fontSize: '1.25rem', color: '#16a34a' }}>
            In-App &amp; Push
          </div>
        </div>
      </div>

      {feedback.message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {feedback.message}
        </div>
      )}

      <div className="admin-notifs-grid">
        {/* Broadcast Form */}
        <div className="broadcast-card">
          <h2>Create Broadcast Campaign</h2>
          <form onSubmit={handleBroadcast}>
            <div className="notif-form-group">
              <label htmlFor="camp-title">Campaign Title</label>
              <input
                id="camp-title"
                type="text"
                placeholder="e.g. Flash Discount or Term 2 Exam Papers Live"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="notif-form-row">
              <div className="notif-form-group">
                <label htmlFor="camp-audience">Target Audience</label>
                <select
                  id="camp-audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  <option value="all">All Registered Users</option>
                  <option value="students">Students &amp; Parents Only</option>
                  <option value="tutors">Tutors &amp; Content Sellers</option>
                  <option value="admins">Admin Personnel</option>
                </select>
              </div>

              <div className="notif-form-group">
                <label htmlFor="camp-type">Notification Type</label>
                <select
                  id="camp-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="promotion">Marketing / Promotion</option>
                  <option value="system">System / Announcement</option>
                  <option value="general">General Notice</option>
                </select>
              </div>
            </div>

            <div className="notif-form-group">
              <label htmlFor="camp-body">Message Body</label>
              <textarea
                id="camp-body"
                placeholder="Write your announcement or promo details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="notif-form-group">
              <label className="notif-checkbox-label">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                Simulate outbound email dispatch to verified addresses
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Broadcasting...' : 'Dispatch Campaign Now'}
            </button>
          </form>
        </div>

        {/* Campaign History */}
        <div className="campaigns-card">
          <h2>Dispatched History</h2>
          {loading ? (
            <p style={{ color: '#64748b' }}>Loading campaign logs...</p>
          ) : campaigns.length === 0 ? (
            <p style={{ color: '#64748b' }}>No campaigns have been broadcast yet.</p>
          ) : (
            <div>
              {campaigns.map((camp) => (
                <div key={camp.id} className="campaign-item">
                  <div className="campaign-item-header">
                    <span className="campaign-title">{camp.title}</span>
                    <span className="badge-audience">{camp.targetAudience}</span>
                  </div>
                  <p className="campaign-body">{camp.message}</p>
                  <div className="campaign-meta">
                    <span className="badge-type">{camp.type}</span>
                    <span>&bull;</span>
                    <span>Recipients: {camp.recipientCount}</span>
                    <span>&bull;</span>
                    <span>Status: {camp.status}</span>
                    <span>&bull;</span>
                    <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
