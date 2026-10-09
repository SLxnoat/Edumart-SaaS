import React, { useState } from 'react';
import './PaymentModal.css';

/**
 * PaymentModal handles:
 * 1. Payment processing modal with spinner
 * 2. 3D Secure (3DS) authentication challenge & OTP verification
 * 3. Payment success confirmation
 * 4. Payment error handling and retry option
 */
const PaymentModal = ({
  isOpen,
  status, // 'processing' | 'requires_3ds' | 'success' | 'error'
  amount,
  errorMessage,
  onComplete3DS,
  onRetry,
  onCancel,
}) => {
  const [otp, setOtp] = useState('123456');

  if (!isOpen) return null;

  return (
    <div className="payment-modal-backdrop" role="dialog" aria-modal="true">
      <div className="payment-modal-content">
        <div className="payment-modal-header">
          <h3>🔒 Secure Payment Gateway</h3>
          {(status === 'error' || status === 'requires_3ds') && (
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={onCancel}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <div className="payment-modal-body">
          {status === 'processing' && (
            <div className="payment-spinner-container">
              <div className="payment-spinner" />
              <h4>Processing Payment...</h4>
              <p>Communicating with your card issuer. Please do not refresh or close this window.</p>
              <div className="payment-security-note">
                <span>🛡️</span> 256-Bit SSL Encrypted & PCI DSS Compliant
              </div>
            </div>
          )}

          {status === 'requires_3ds' && (
            <div className="tds-container">
              <span className="tds-badge">3D Secure 2.0 Authentication</span>
              <h4>Verify Your Transaction</h4>
              <p>Your issuing bank requires additional authentication for this purchase of <strong>${Number(amount || 0).toFixed(2)}</strong>.</p>
              
              <div className="tds-prompt">
                <p>We sent a 6-digit confirmation code to your registered mobile device ending in <strong>••89</strong>.</p>
                <div className="tds-otp-group">
                  <label htmlFor="otp-input">Enter Authentication Code (OTP):</label>
                  <input
                    id="otp-input"
                    type="text"
                    className="tds-otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="tds-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onComplete3DS(otp)}
                  disabled={!otp || otp.length < 4}
                >
                  Authorize Payment →
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="payment-spinner-container">
              <div className="payment-success-icon">✓</div>
              <h4>Payment Authorized!</h4>
              <p>Your payment of <strong>${Number(amount || 0).toFixed(2)}</strong> was processed successfully. Finalizing your order...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="payment-spinner-container">
              <div className="payment-error-icon">✕</div>
              <h4>Payment Failed</h4>
              <p className="payment-error-desc">{errorMessage || 'Your transaction was declined by the card issuer.'}</p>
              <div className="tds-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onCancel}
                >
                  Change Payment Method
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onRetry}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
