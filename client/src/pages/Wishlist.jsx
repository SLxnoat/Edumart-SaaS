import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../components/Wishlist.css';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch('/api/wishlist', { credentials: 'include' });

        // For now, we'll simulate with placeholder data that matches expected structure
        // This data would normally come from the backend
        const mockWishlistItems = [
          {
            id: 'WL-001',
            product: {
              id: 'PROD-002',
              name: 'Biology Revision Notes',
              price: 19.99,
              rating: 4.5,
              reviewCount: 89,
              thumbnail: '/placeholder-product-2.jpg',
              isNew: true,
              isFeatured: false
            },
            addedAt: '2026-09-28T10:30:00Z'
          },
          {
            id: 'WL-002',
            product: {
              id: 'PROD-005',
              name: 'English Literature Study Guide',
              price: 14.99,
              rating: 4.3,
              reviewCount: 78,
              thumbnail: '/placeholder-product-5.jpg',
              isNew: true,
              isFeatured: false
            },
            addedAt: '2026-09-25T14:15:00Z'
          },
          {
            id: 'WL-003',
            product: {
              id: 'PROD-006',
              name: 'Math Problem Solving Workbook',
              price: 22.99,
              rating: 4.7,
              reviewCount: 103,
              thumbnail: '/placeholder-product-6.jpg',
              isNew: false,
              isFeatured: false
            },
            addedAt: '2026-09-20T09:45:00Z'
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setWishlistItems(mockWishlistItems);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load wishlist');
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      // In a real implementation, this would call an API like:
      // await fetch(`/api/wishlist/${itemId}`, { method: 'DELETE', credentials: 'include' });

      // For now, remove from state
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.message || 'Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (itemId) => {
    try {
      // In a real implementation, this would move item from wishlist to cart via API
      // For now, we'll remove from wishlist and show success message
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      alert('Item moved to your cart!');
    } catch (err) {
      setError(err.message || 'Failed to move item to cart');
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
                  onClick={() => handleMoveToCart(item.id)}
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
          onClick={() => {
            // In a real app, this would move all items to cart
            alert('All items moved to cart!');
            setWishlistItems([]);
          }}
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