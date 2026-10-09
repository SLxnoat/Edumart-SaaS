import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, removeFromWishlist, addToCart } from '../api';
import '../components/Wishlist.css';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/wishlist', { auth: true });
        if (!cancelled) setWishlistItems(data.items);
      } catch (err) {
        if (!cancelled) {
          if (err.status === 401) navigate('/login');
          else setError(err.message || 'Failed to load wishlist');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWishlist();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.message || 'Failed to remove item from wishlist');
    }
  };

  const moveItemToCart = async (item) => {
    await addToCart(item.product.id, 1);
    await removeFromWishlist(item.id);
  };

  const handleMoveToCart = async (item) => {
    try {
      await moveItemToCart(item);
      setWishlistItems(prev => prev.filter(i => i.id !== item.id));
      navigate('/cart');
    } catch (err) {
      setError(err.message || 'Failed to move item to cart');
    }
  };

  const handleMoveAllToCart = async () => {
    try {
      for (const item of wishlistItems) {
        await moveItemToCart(item);
      }
      setWishlistItems([]);
      navigate('/cart');
    } catch (err) {
      setError(err.message || 'Failed to move items to cart');
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="wishlist-loading">
          <div className="wishlist-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>My Wishlist</h1>
          </div>
          <div className="wishlist-content">
            <div className="loading-spinner"></div>
            <p>Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="wishlist-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>My Wishlist</h1>
        </div>
        <div className="wishlist-content">
          <div className="alert alert-error">
            {error}
            <button className="btn btn-sm btn-link" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If wishlist is empty
  if (wishlistItems.length === 0) {
    return (
      <div className="page-shell">
        <div className="wishlist-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>My Wishlist</h1>
          <p className="wishlist-subtitle">Save products you love for later</p>
        </div>
        <div className="wishlist-content">
          <div className="empty-state">
            <div className="empty-state-icon">💖</div>
            <p className="empty-state-title">Your wishlist is empty</p>
            <p className="empty-state-description">
              Save products to your wishlist by clicking the heart icon on product cards.
            </p>
            <Link to="/catalog" className="btn btn-outline">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="wishlist-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>My Wishlist</h1>
        <p className="wishlist-subtitle">Save products you love for later</p>
      </div>

      {/* Wishlist Items */}
      <div className="wishlist-items">
        {wishlistItems.map(item => (
          <div key={item.id} className="wishlist-item">
            <div className="wishlist-item-content">
              <Link to={`/product/${item.product.id}`} className="wishlist-item-link">
                <div className="wishlist-item-image">
                  <img
                    src={item.product.thumbnail || '/placeholder-product.jpg'}
                    alt={item.product.name}
                  />
                </div>
                <div className="wishlist-item-info">
                  <h3 className="wishlist-item-title">{item.product.name}</h3>
                  <div className="wishlist-item-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${star <= item.product.rating ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-count">({item.product.reviewCount})</span>
                  </div>
                  <div className="wishlist-item-price">
                    ${item.product.price.toFixed(2)}
                  </div>
                </div>
              </Link>
              <div className="wishlist-item-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => handleMoveToCart(item)}
                >
                  Move to Cart
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wishlist Actions */}
      <div className="wishlist-actions">
        <button
          className="btn btn-outline"
          onClick={handleMoveAllToCart}
        >
          Move All to Cart
        </button>
        <Link to="/catalog" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;