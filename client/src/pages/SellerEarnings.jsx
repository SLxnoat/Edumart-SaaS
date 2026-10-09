import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerEarnings, requestPayout } from '../api';
import '../components/SellerPages.css';

const SellerEarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(null);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSellerEarnings();
      setEarnings(res.earnings);
    } catch (err) {
      setError(err.message || 'Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      setError('Please enter a valid payout amount');
      return;
    }
    if (earnings && parseFloat(payoutAmount) > earnings.availablePayout) {
      setError(`Requested amount exceeds available balance ($${earnings.availablePayout.toFixed(2)})`);
      return;
    }

    try {
      setRequesting(true);
      setError(null);
      const res = await requestPayout({
        amount: parseFloat(payoutAmount),
        payoutMethod,
        accountDetails: payoutAccount,
      });
      setPayoutSuccess(res.message || 'Payout request submitted successfully!');
      setPayoutAmount('');
      setPayoutAccount('');
      // refresh earnings
      await fetchEarnings();
    } catch (err) {
      setError(err.message || 'Payout request failed');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="page-shell seller-page-container">
      <div className="seller-page-header">
        <div>
          <Link to="/seller/dashboard" className="btn btn-link">← Back to Dashboard</Link>
          <h1>Earnings & Payouts</h1>
          <p className="seller-page-subtitle">Track your revenue, platform fee deductions, and withdraw funds</p>
        </div>
      </div>

      {payoutSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {payoutSuccess}
          <button className="btn btn-sm btn-link" onClick={() => setPayoutSuccess(null)}>×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Calculating your earnings...</p>
        </div>
      ) : earnings ? (
        <>
          <div className="earnings-overview-grid">
            <div className="earnings-card">
              <h3>Gross Sales</h3>
              <div className="amount">${earnings.totalGross.toFixed(2)}</div>
              <p className="caption">Total revenue before platform fees</p>
            </div>

            <div className="earnings-card">
              <h3>EduMart Platform Fee</h3>
              <div className="amount">{(earnings.platformFeeRate * 100).toFixed(0)}%</div>
              <p className="caption">Service, hosting, and payment gateway fee</p>
            </div>

            <div className="earnings-card highlight">
              <h3>Available Payout</h3>
              <div className="amount">${earnings.availablePayout.toFixed(2)}</div>
              <p className="caption">Eligible for immediate withdrawal</p>
            </div>

            <div className="earnings-card">
              <h3>Pending Clearance</h3>
              <div className="amount">${earnings.pendingPayout.toFixed(2)}</div>
              <p className="caption">Orders awaiting 7-day settlement</p>
            </div>
          </div>

          <div className="payout-section">
            <h2>Request Payout</h2>
            <p style={{ color: '#64748b', margin: '0.25rem 0 1.5rem' }}>
              Minimum withdrawal amount is $10.00. Funds arrive within 2-3 business days.
            </p>

            <form onSubmit={handlePayoutSubmit} className="payout-form">
              <div>
                <label htmlFor="payoutAmount" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Amount (USD $) *
                </label>
                <input
                  type="number"
                  id="payoutAmount"
                  step="0.01"
                  min="10"
                  max={earnings.availablePayout > 10 ? earnings.availablePayout : 10000}
                  placeholder={`Max: $${earnings.availablePayout.toFixed(2)}`}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label htmlFor="payoutMethod" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Payout Method *
                </label>
                <select
                  id="payoutMethod"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe Connect</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={requesting || earnings.availablePayout <= 0}
                  style={{ height: '44px', padding: '0 1.5rem' }}
                >
                  {requesting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="payoutAccount" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Account / Email Details
              </label>
              <input
                type="text"
                id="payoutAccount"
                placeholder={payoutMethod === 'paypal' ? 'your-paypal-email@domain.com' : 'Bank Account / IBAN / Swift Code'}
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                style={{ width: '100%', maxWidth: '500px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SellerEarningsPage;
