import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminSettings, updateAdminSettings } from '../api';
import '../components/AdminSettings.css';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [settings, setSettings] = useState({
    general: {
      siteName: 'EduMart Marketplace',
      supportEmail: 'support@edumart.lk',
      contactPhone: '+94 11 234 5678',
      maintenanceMode: false,
      defaultCurrency: 'LKR',
      allowRegistrations: true,
    },
    commissions: {
      platformCommissionPercent: 10,
      minPayoutAmount: 2500,
      payoutHoldPeriodDays: 7,
      autoApproveVerifiedSellers: false,
    },
    security: {
      enforceEmailVerification: true,
      sessionTimeoutMinutes: 120,
      maxLoginAttempts: 5,
      allowGuestBrowsing: true,
    },
    notifications: {
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      marketingEmailsDefaultOptIn: true,
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getAdminSettings();
      if (res && res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleGeneralChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [key]: value },
    }));
  };

  const handleCommissionsChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      commissions: { ...prev.commissions, [key]: value },
    }));
  };

  const handleSecurityChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [key]: value },
    }));
  };

  const handleNotificationsChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });
      const res = await updateAdminSettings(settings);
      if (res && res.success) {
        setFeedback({ type: 'success', message: 'System configuration settings saved successfully!' });
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to update settings.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading platform settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-container">
      <div className="admin-settings-header">
        <Link to="/admin" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          &larr; Back to Admin Dashboard
        </Link>
        <h1>System Settings &amp; Platform Controls</h1>
        <p className="admin-settings-subtitle">
          Configure marketplace fees, security options, communication toggles, and global defaults.
        </p>
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

      <form onSubmit={handleSave}>
        {/* General Marketplace Settings */}
        <div className="settings-card">
          <h2>General Marketplace</h2>
          <p className="settings-card-desc">Basic contact information and operational modes</p>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="site-name">Platform Brand Name</label>
              <input
                id="site-name"
                type="text"
                value={settings.general.siteName || ''}
                onChange={(e) => handleGeneralChange('siteName', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="support-email">Official Support Email</label>
              <input
                id="support-email"
                type="email"
                value={settings.general.supportEmail || ''}
                onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="contact-phone">Support Hotline</label>
              <input
                id="contact-phone"
                type="text"
                value={settings.general.contactPhone || ''}
                onChange={(e) => handleGeneralChange('contactPhone', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="currency">Default Currency Code</label>
              <select
                id="currency"
                value={settings.general.defaultCurrency || 'LKR'}
                onChange={(e) => handleGeneralChange('defaultCurrency', e.target.value)}
              >
                <option value="LKR">LKR (Sri Lankan Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Allow New User Registrations</h4>
              <p>Permit students, tutors, and teachers to create new EduMart accounts</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.general.allowRegistrations ?? true}
                onChange={(e) => handleGeneralChange('allowRegistrations', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Maintenance Mode</h4>
              <p>Take marketplace offline for routine database upgrades or updates</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.general.maintenanceMode ?? false}
                onChange={(e) => handleGeneralChange('maintenanceMode', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Commission & Seller Payout Settings */}
        <div className="settings-card">
          <h2>Commissions &amp; Seller Payouts</h2>
          <p className="settings-card-desc">Control fee deductions and payout eligibility rules</p>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="comm-rate">Platform Commission Rate (%)</label>
              <input
                id="comm-rate"
                type="number"
                min="0"
                max="50"
                value={settings.commissions.platformCommissionPercent || 10}
                onChange={(e) => handleCommissionsChange('platformCommissionPercent', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="min-payout">Minimum Payout Withdrawal (Rs.)</label>
              <input
                id="min-payout"
                type="number"
                min="500"
                step="100"
                value={settings.commissions.minPayoutAmount || 2500}
                onChange={(e) => handleCommissionsChange('minPayoutAmount', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="hold-period">Escrow / Payout Holding Period (Days)</label>
              <input
                id="hold-period"
                type="number"
                min="1"
                max="30"
                value={settings.commissions.payoutHoldPeriodDays || 7}
                onChange={(e) => handleCommissionsChange('payoutHoldPeriodDays', e.target.value)}
              />
            </div>
          </div>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Auto-Approve Materials by Verified Tutors</h4>
              <p>Bypass the manual moderation queue for sellers with verified credentials</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.commissions.autoApproveVerifiedSellers ?? false}
                onChange={(e) => handleCommissionsChange('autoApproveVerifiedSellers', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Security & Access Controls */}
        <div className="settings-card">
          <h2>Security &amp; Session Policies</h2>
          <p className="settings-card-desc">Login throttles, session durations, and guest restrictions</p>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="sess-timeout">Session Timeout (Minutes)</label>
              <input
                id="sess-timeout"
                type="number"
                min="15"
                max="1440"
                value={settings.security.sessionTimeoutMinutes || 120}
                onChange={(e) => handleSecurityChange('sessionTimeoutMinutes', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="login-attempts">Max Failed Login Attempts</label>
              <input
                id="login-attempts"
                type="number"
                min="3"
                max="15"
                value={settings.security.maxLoginAttempts || 5}
                onChange={(e) => handleSecurityChange('maxLoginAttempts', e.target.value)}
              />
            </div>
          </div>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Enforce Email Verification</h4>
              <p>Require users to click verification links before purchasing or publishing materials</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.security.enforceEmailVerification ?? true}
                onChange={(e) => handleSecurityChange('enforceEmailVerification', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Allow Guest Browsing</h4>
              <p>Allow unauthenticated visitors to search materials and read product descriptions</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.security.allowGuestBrowsing ?? true}
                onChange={(e) => handleSecurityChange('allowGuestBrowsing', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Notifications & Communications */}
        <div className="settings-card">
          <h2>Communications &amp; Alerts</h2>
          <p className="settings-card-desc">Control platform communication channels</p>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Transactional Email Notifications</h4>
              <p>Order confirmations, receipts, and account security notifications</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotificationsEnabled ?? true}
                onChange={(e) => handleNotificationsChange('emailNotificationsEnabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-toggle">
            <div className="toggle-info">
              <h4>Browser Push Notifications</h4>
              <p>Real-time moderation alerts and seller order updates</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.notifications.pushNotificationsEnabled ?? true}
                onChange={(e) => handleNotificationsChange('pushNotificationsEnabled', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchSettings}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reset Changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: '#ffffff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
