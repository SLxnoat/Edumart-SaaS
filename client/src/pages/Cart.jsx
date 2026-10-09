import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api';
import '../components/Cart.css';

const money = (n) => `$${Number(n).toFixed(2)}`;

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data.cart);
    } catch (err) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id, action) => {
    setBusyId(id);
    setError(null);
    try {
      const data = await action();
      setCart(data.cart);
    } catch (err) {
      setError(err.message || 'Cart update failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <h1>Cart</h1>
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary;

  return (
    <div className="page-shell cart-page">
      <Link to="/catalog" className="btn btn-link">← Continue shopping</Link>
      <h1>Cart</h1>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p className="empty-state-title">Your cart is empty</p>
          <p className="empty-state-description">Browse the catalog to find learning materials.</p>
          <Link to="/catalog" className="btn btn-outline">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-items">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <Link to={`/product/${item.product.id}`} className="cart-item-title">
                  {item.product.name}
                </Link>
                {!item.available && <span className="badge">No longer available</span>}
                <span className="cart-item-price">{money(item.unitPrice)}</span>
                <div className="cart-item-qty">
                  <button
                    className="btn btn-sm"
                    aria-label="Decrease quantity"
                    disabled={busyId === item.id || item.quantity <= 1}
                    onClick={() => run(item.id, () => updateCartItem(item.id, item.quantity - 1))}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn btn-sm"
                    aria-label="Increase quantity"
                    disabled={busyId === item.id || item.quantity >= item.maxQuantity}
                    onClick={() => run(item.id, () => updateCartItem(item.id, item.quantity + 1))}
                  >
                    +
                  </button>
                </div>
                <span className="cart-item-total">{money(item.lineTotal)}</span>
                <button
                  className="btn btn-sm btn-link"
                  disabled={busyId === item.id}
                  onClick={() => run(item.id, () => removeCartItem(item.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <dl>
              <dt>Items</dt><dd>{summary.itemCount}</dd>
              <dt>Subtotal</dt><dd>{money(summary.subtotal)}</dd>
              <dt>Tax ({Math.round(summary.taxRate * 100)}%)</dt><dd>{money(summary.taxAmount)}</dd>
              <dt className="cart-total">Total</dt><dd className="cart-total">{money(summary.total)}</dd>
            </dl>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
            <button className="btn btn-outline" onClick={() => run('clear', clearCart)} disabled={busyId === 'clear'}>
              Clear Cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
