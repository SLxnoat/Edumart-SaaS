import React from 'react';
import './PaymentForm.css';

/**
 * PaymentForm component:
 * Provides credit card / debit card / digital wallet inputs, card validation,
 * presets for testing standard transactions vs. 3D Secure challenges, and security badges.
 */
const PaymentForm = ({
  paymentData,
  onChange,
  onPresetSelect,
}) => {
  const {
    paymentMethod = 'card',
    cardName = '',
    cardNumber = '',
    cardExp = '',
    cardCvc = '',
  } = paymentData;

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    onChange({ target: { name: 'cardNumber', value: formatted } });
  };

  const handleExpChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    onChange({ target: { name: 'cardExp', value: raw } });
  };

  const handleCvcChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({ target: { name: 'cardCvc', value: raw } });
  };

  return (
    <div className="payment-form-card">
      <div className="payment-methods-selector">
        <label className={`method-choice ${paymentMethod === 'card' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={onChange}
          />
          <span>💳 Credit / Debit Card</span>
        </label>
        <label className={`method-choice ${paymentMethod === 'paypal' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={onChange}
          />
          <span>🅿️ PayPal</span>
        </label>
      </div>

      {paymentMethod === 'card' ? (
        <div className="card-fields-box">
          <div className="form-group">
            <label htmlFor="cardName">Cardholder Name *</label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              placeholder="e.g. Jane Doe"
              value={cardName}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cardNumber">Card Number *</label>
            <div className="card-input-wrapper">
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                required
              />
              <span className="card-brand-badge">VISA / MC</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardExp">Expiry Date *</label>
              <input
                type="text"
                id="cardExp"
                name="cardExp"
                placeholder="MM/YY"
                value={cardExp}
                onChange={handleExpChange}
                maxLength={5}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cardCvc">CVC / CVV *</label>
              <input
                type="password"
                id="cardCvc"
                name="cardCvc"
                placeholder="123"
                value={cardCvc}
                onChange={handleCvcChange}
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="card-presets">
            <span>Test Cards:</span>
            <button
              type="button"
              className="card-preset-btn"
              onClick={() => onPresetSelect('success')}
            >
              Direct Success Card
            </button>
            <button
              type="button"
              className="card-preset-btn"
              onClick={() => onPresetSelect('3ds')}
            >
              3D Secure (3DS) Test Card
            </button>
            <button
              type="button"
              className="card-preset-btn"
              onClick={() => onPresetSelect('decline')}
            >
              Decline Test Card
            </button>
          </div>

          <div className="tds-notice-row">
            <span>🔒</span>
            <span>Supports 3D Secure 2.0 (Verified by Visa & Mastercard Identity Check)</span>
          </div>
        </div>
      ) : (
        <div className="card-fields-box">
          <p>You will be redirected to PayPal to complete your purchase securely.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
