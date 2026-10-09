import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addToWishlist, addToCart } from '../api';

const ProductCard = ({ product }) => {
  const { id, name, price, originalPrice, discount, rating, reviewCount, thumbnail, isNew, isFeatured } = product;

  const navigate = useNavigate();
  const [saved, setSaved] = React.useState(false);

  const handleSaveForLater = async () => {
    try {
      await addToWishlist(id);
      setSaved(true);
    } catch (err) {
      if (err.status === 401) navigate('/login');
      else alert(err.message || 'Could not save this item');
    }
  };

  const [added, setAdded] = React.useState(false);

  const handleAddToCart = async () => {
    try {
      await addToCart(id, 1);
      setAdded(true);
    } catch (err) {
      alert(err.message || 'Could not add this item to the cart');
    }
  };

  const formattedPrice = price ? `$${price.toFixed(2)}` : 'Free';
  const formattedOriginalPrice = originalPrice ? `$${originalPrice.toFixed(2)}` : null;
  const discountPercent = discount ? `${discount}% OFF` : null;

  return (
    <div className="product-card">
      <div className="product-badge-container">
        {isNew && <span className="badge badge-new">New</span>}
        {isFeatured && <span className="badge badge-featured">Featured</span>}
        {discountPercent && <span className="badge badge-discount">{discountPercent}</span>}
      </div>

      <div className="product-image-container">
        <Link to={`/product/${id}`}>
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="product-image" />
          ) : (
            <div className="product-image product-image-placeholder" role="img" aria-label={name}>📘</div>
          )}
        </Link>
        <div className="product-overlay">
          <button className="btn btn-icon add-to-cart" aria-label="Add to cart" onClick={handleAddToCart}>
            <span className="icon">𛒓</span>
          </button>
          <button className="btn btn-icon wishlist" aria-label="Add to wishlist" onClick={handleSaveForLater}>
            <span className="icon">{saved ? '♥' : '♡'}</span>
          </button>
          <button className="btn btn-icon quick-view" aria-label="Quick view">
            <span className="icon">👁️</span>
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-rating">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${star <= rating ? 'filled' : 'empty'}`}
            >
              ★
            </span>
          ))}
          <span className="rating-count">({reviewCount})</span>
        </div>

        <Link to={`/product/${id}`} className="product-title">
          <h3>{name}</h3>
        </Link>

        <div className="product-price">
          {formattedOriginalPrice && (
            <span className="original-price">{formattedOriginalPrice}</span>
          )}
          <span className="current-price">{formattedPrice}</span>
        </div>
      </div>

      <div className="product-actions">
        <button className="btn btn-outline add-to-cart" onClick={handleAddToCart}>
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
        <button className="btn btn-outline wishlist" onClick={handleSaveForLater} disabled={saved}>
          {saved ? 'Saved' : 'Save for Later'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;