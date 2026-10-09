import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerAnalytics } from '../api';
import '../components/SellerPages.css';

const SellerAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getSellerAnalytics();
        setAnalytics(res.analytics);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalSubjectViews = analytics?.viewsBySubject
    ? Object.values(analytics.viewsBySubject).reduce((acc, v) => acc + v, 0)
    : 0;

  const maxMonthlyRevenue = analytics?.monthlyBreakdown?.length
    ? Math.max(...analytics.monthlyBreakdown.map((m) => m.revenue))
    : 1;

  return (
    <div className="page-shell seller-page-container">
      <div className="seller-page-header">
        <div>
          <Link to="/seller/dashboard" className="btn btn-link">← Back to Dashboard</Link>
          <h1>Sales Analytics & Reporting</h1>
          <p className="seller-page-subtitle">Understand visitor interest, top performing subject areas, and historical sales trends</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Aggregating store metrics...</p>
        </div>
      ) : analytics ? (
        <>
          <div className="analytics-grid">
            {/* Subject Breakdown */}
            <div className="analytics-card">
              <h2>Popularity by Subject</h2>
              {Object.keys(analytics.viewsBySubject || {}).length === 0 ? (
                <p style={{ color: '#64748b' }}>No subject data recorded yet.</p>
              ) : (
                <div>
                  {Object.entries(analytics.viewsBySubject).map(([subject, views]) => {
                    const pct = totalSubjectViews > 0 ? Math.round((views / totalSubjectViews) * 100) : 0;
                    return (
                      <div key={subject} className="bar-progress-group">
                        <div className="bar-progress-label">
                          <span>{subject}</span>
                          <span>{views} views ({pct}%)</span>
                        </div>
                        <div className="bar-progress-track">
                          <div className="bar-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly Trend Chart */}
            <div className="analytics-card">
              <h2>Monthly Revenue Trend (USD)</h2>
              <div className="monthly-chart-bars">
                {analytics.monthlyBreakdown?.map((item) => {
                  const barHeightPct = Math.round((item.revenue / maxMonthlyRevenue) * 100);
                  return (
                    <div key={item.month} className="monthly-bar-col">
                      <div className="monthly-bar-val">${item.revenue}</div>
                      <div className="monthly-bar" style={{ height: `${barHeightPct}%` }} />
                      <div className="monthly-bar-label">{item.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="seller-table-card" style={{ marginTop: '1.5rem' }}>
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders Fulfilled</th>
                  <th>Total Revenue</th>
                  <th>Average Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthlyBreakdown?.map((row) => (
                  <tr key={row.month}>
                    <td><strong>{row.month}</strong></td>
                    <td>{row.sales} orders</td>
                    <td><strong>${row.revenue.toLocaleString()}</strong></td>
                    <td>${(row.revenue / (row.sales || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SellerAnalyticsPage;
