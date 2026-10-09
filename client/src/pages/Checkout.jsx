import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, validateCoupon, submitCheckout, confirmPayment } from '../api';
import '../components/Checkout.css';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Info/Address, 2: Payment, 3: Review

  // Form states
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'card',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '123',
  });

  useEffect(() => {
    getCart()
      .then((data) => {
        if (!data.cart?.items?.length) {
          navigate('/cart');
          return;
        }
        setCart(data.cart);
      })
      .catch((err) => setError(err.message || 'Failed to load cart'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    try {
      const res = await validateCoupon(couponCode.trim());
      setCouponDiscount(res.discountAmount);
      setCouponInfo(res.coupon);
    } catch (err) {
      setCouponDiscount(0);
      setCouponInfo(null);
      setCouponError(err.message || 'Invalid coupon');
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please enter your name and email');
        return;
      }
      const hasPhysical = cart.items.some((i) => i.product.format === 'Print');
      if (hasPhysical && (!formData.addressLine1 || !formData.city)) {
        setError('Physical items in cart require a shipping address');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create order
      const checkoutRes = await submitCheckout({
        guestEmail: formData.email,
        couponCode: couponInfo ? couponCode : undefined,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });

      const order = checkoutRes.order;

      // 2. Process payment
      await confirmPayment({
        orderId: order.id,
        paymentMethod: formData.paymentMethod,
      });

      // 3. Navigate to Order Confirmation
      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch (err) {
      setError(err.message || 'Failed to complete order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="loading-spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const hasPhysical = items.some((i) => i.product.format === 'Print');
  const subtotal = cart?.summary?.subtotal || 0;
  const shippingCost = hasPhysical ? (subtotal > 50 ? 0 : 5) : 0;
  const taxable = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxable * 0.1 * 100) / 100;
  const total = Math.round((taxable + shippingCost + tax) * 100) / 100;

  return (
    <div className="page-shell checkout-page">
      <Link to="/cart" className="btn btn-link">← Back to Cart</Link>
      <h1>Secure Checkout</h1>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="checkout-steps-nav">
        <span className={`step-badge ${step >= 1 ? 'active' : ''}`}>1. Information</span>
        <span className="step-sep">→</span>
        <span className={`step-badge ${step >= 2 ? 'active' : ''}`}>2. Payment</span>
        <span className="step-sep">→</span>
        <span className={`step-badge ${step >= 3 ? 'active' : ''}`}>3. Review</span>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="checkout-form-step">
              <h2>Contact & Shipping Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {hasPhysical ? (
                <>
                  <h3>Shipping Address (Required for Physical Materials)</h3>
                  <div className="form-group">
                    <label htmlFor="addressLine1">Street Address *</label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="digital-notice">
                  ℹ️ All items in your order are digital downloads and will be delivered instantly to your email.
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notes">Order Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Continue to Payment →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="checkout-form-step">
              <h2>Select Payment Method</h2>
              <div className="payment-options">
                <label className="payment-radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <span>Credit / Debit Card (Stripe Supported)</span>
                </label>
              </div>

              <div className="card-mock-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expires</label>
                    <input
                      type="text"
                      name="cardExp"
                      value={formData.cardExp}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC</label>
                    <input
                      type="text"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                  ← Back to Info
                </button>
                <button type="submit" className="btn btn-primary">
                  Review Order →
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="checkout-form-step">
              <h2>Review & Place Order</h2>
              <div className="review-box">
                <p><strong>Deliver to:</strong> {formData.firstName} {formData.lastName} ({formData.email})</p>
                {hasPhysical && <p><strong>Address:</strong> {formData.addressLine1}, {formData.city}</p>}
                <p><strong>Payment Method:</strong> {formData.paymentMethod.toUpperCase()}</p>
              </div>

              <h3>Items Ordered</h3>
              <ul className="checkout-item-list">
                {items.map((i) => (
                  <li key={i.id} className="checkout-item-row">
                    <span>{i.product.name} × {i.quantity}</span>
                    <span>{money(i.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="step-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                  ← Back to Payment
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Processing Order...' : `Pay & Place Order (${money(total)})`}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="coupon-box">
            <form onSubmit={handleApplyCoupon} className="coupon-form">
              <input
                type="text"
                placeholder="Promo/Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-outline">Apply</button>
            </form>
            {couponInfo && <span className="coupon-success">✓ Code applied: -{money(couponDiscount)}</span>}
            {couponError && <span className="coupon-err">{couponError}</span>}
          </div>

          <dl>
            <dt>Subtotal</dt><dd>{money(subtotal)}</dd>
            {couponDiscount > 0 && (
              <>
                <dt>Discount</dt><dd className="discount-val">-{money(couponDiscount)}</dd>
              </>
            )}
            <dt>Shipping</dt><dd>{shippingCost === 0 ? 'FREE' : money(shippingCost)}</dd>
            <dt>Estimated Tax (10%)</dt><dd>{money(tax)}</dd>
            <dt className="summary-total">Total</dt><dd className="summary-total">{money(total)}</dd>
          </dl>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
