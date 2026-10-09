import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeCartItem } from '../api';
import './MiniCart.css';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const MiniCart = () => {
  const [cart, setCart] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data.cart);
    } catch {
      // Cart fetch fail safe
    }
  };

  useEffect(() => {
    fetchCart();
    // Poll or listen for cart updates periodically or on window focus
    const onFocus = () => fetchCart();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemove = async (itemId, e) => {
    e.stopPropagation();
    try {
      const res = await removeCartItem(itemId);
      setCart(res.cart);
    } catch {
      // Ignore
    }
  };

  const items = cart?.items || [];
  const itemCount = cart?.summary?.itemCount || 0;
  const subtotal = cart?.summary?.subtotal || 0;

  return (
    <div className="mini-cart-container" ref={dropdownRef}>
      <button
        type="button"
        className="mini-cart-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Shopping Cart"
      >
        <span className="cart-icon">🛒</span>
        <span className="cart-label">Cart</span>
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>

      {isOpen && (
        <div className="mini-cart-dropdown">
          <div className="mini-cart-header">
            <h3>Your Cart ({itemCount})</h3>
            <button
              type="button"
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {items.length === 0 ? (
            <div className="mini-cart-empty">
              <p>Your cart is empty</p>
              <Link
                to="/catalog"
                className="btn btn-sm btn-outline"
                onClick={() => setIsOpen(false)}
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <>
              <ul className="mini-cart-list">
                {items.map((item) => (
                  <li key={item.id} className="mini-cart-item">
                    <div className="mini-item-details">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="mini-item-title"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.product.name}
                      </Link>
                      <span className="mini-item-meta">
                        Qty: {item.quantity} × {money(item.unitPrice)}
                      </span>
                    </div>
                    <div className="mini-item-actions">
                      <span className="mini-item-total">{money(item.lineTotal)}</span>
                      <button
                        type="button"
                        className="mini-remove-btn"
                        onClick={(e) => handleRemove(item.id, e)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mini-cart-footer">
                <div className="mini-subtotal-row">
                  <span>Subtotal:</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div className="mini-cart-actions">
                  <Link
                    to="/cart"
                    className="btn btn-sm btn-outline"
                    onClick={() => setIsOpen(false)}
                  >
                    View Cart
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/checkout');
                    }}
                  >
                    Checkout →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniCart;
