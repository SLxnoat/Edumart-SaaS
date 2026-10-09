import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiFetch, addToWishlist, addToCart } from '../api';
import RelatedProducts from '../components/RelatedProducts';
import '../components/ProductDetail.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description, reviews, details
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setActiveImage(0);
        const data = await apiFetch(`/api/materials/${encodeURIComponent(productId)}`);
        if (!cancelled) setProduct(data.product);
      } catch (err) {
        if (!cancelled) {
          if (err.status === 404) setProduct(null);
          else setError(err.message || 'Failed to load product details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      if (window.confirm(`${product.name} was added to your cart. View cart now?`)) navigate('/cart');
    } catch (err) {
      alert(err.message || 'Could not add this item to the cart');
    }
  };

  const handleSaveForLater = async () => {
    try {
      await addToWishlist(product.id);
      alert(`${product.name} has been saved for later!`);
    } catch (err) {
      if (err.status === 401) navigate('/login');
      else alert(err.message || 'Could not save this item');
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, product.stock || 99));
  };

  const handleDecreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedRating || !reviewText.trim()) {
      alert('Please provide a rating and comment for your review');
      return;
    }
    // In a real app, this would submit review via API
    alert('Thank you for your review! It will be published after moderation.');
    setSelectedRating(0);
    setReviewText('');
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="product-detail-loading">
          <div className="product-detail-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>Product Details</h1>
          </div>
          <div className="product-detail-content">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="product-detail-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Product Details</h1>
        </div>
        <div className="product-detail-content">
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

  // If no product
  if (!product) {
    return (
      <div className="page-shell">
        <div className="product-detail-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Product Details</h1>
        </div>
        <div className="product-detail-content">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-title">Product not found</p>
            <p className="empty-state-description">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link to="/catalog" className="btn btn-outline">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { name, price, originalPrice, discount, rating, reviewCount, description, shortDescription, images, isNew, isFeatured, category, subcategory, gradeLevel, examYear, format, pages, fileSize, publisher, publicationDate, language, isDigital, isPhysical, stock, sku, vendor, reviews } = product;

  const formattedPrice = price ? `$${price.toFixed(2)}` : 'Free';
  const formattedOriginalPrice = originalPrice ? `$${originalPrice.toFixed(2)}` : null;
  const discountPercent = discount ? `${discount}% OFF` : null;

  return (
    <div className="page-shell">
      <div className="product-detail-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>{name}</h1>
        <div className="product-badge-container">
          {isNew && <span className="badge badge-new">New</span>}
          {isFeatured && <span className="badge badge-featured">Featured</span>}
          {discountPercent && <span className="badge badge-discount">{discountPercent}</span>}
        </div>
      </div>

      <div className="product-detail-content">
        <div className="product-gallery">
          <div className="main-image">
            <img
              src={images?.[activeImage] || '/placeholder-product.jpg'}
              alt={name}
            />
          </div>

          {images?.length > 1 && (
            <div className="thumbnail-grid">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${name} ${index + 1}`}
                  className={index === activeImage ? 'active' : ''}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          )}
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
            <span className="rating-value"> ({rating}/5)</span>
            <span className="review-count">({reviewCount} reviews)</span>
          </div>

          <div className="product-price">
            {formattedOriginalPrice && (
              <span className="original-price">{formattedOriginalPrice}</span>
            )}
            <span className="current-price">{formattedPrice}</span>
          </div>

          <div className="product-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={loading}
            >
              {loading ? 'Adding to cart...' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleSaveForLater}
            >
              Save for Later
            </button>
          </div>

          <div className="product-quantity">
            <label htmlFor="quantity">Quantity:</label>
            <div className="quantity-controls">
              <button
                className="btn btn-outline qty-btn"
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                max={stock || 99}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(val, 1), stock || 99));
                }}
                readOnly
              />
              <button
                className="btn btn-outline qty-btn"
                onClick={handleIncreaseQuantity}
                disabled={quantity >= (stock || 99)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="product-tabs">
        <button
          className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({reviewCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      <div className="product-tab-content">
        {activeTab === 'description' && (
          <div className="tab-pane">
            <h2>Product Description</h2>
            <p>{description}</p>

            {shortDescription && (
              <div className="highlight-box">
                <p><strong>Key Features:</strong> {shortDescription}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-pane">
            <h2>Customer Reviews</h2>

            {/* Add Review Form */}
            <div className="add-review-section">
              <h3>Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label htmlFor="reviewRating">Rating</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${star <= selectedRating ? 'filled' : 'empty'}`}
                        onClick={() => setSelectedRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="rating-help">{selectedRating ? `${selectedRating} out of 5` : 'Select a rating'}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="reviewTitle">Title</label>
                  <input
                    type="text"
                    id="reviewTitle"
                    placeholder="Summarize your review"
                    maxLength="100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reviewText">Review</label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product"
                    rows="4"
                    maxLength="500"
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Reviews */}
            <div className="reviews-list">
              {reviews.length === 0 && <p>No reviews yet. Be the first to review this product.</p>}
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-user-info">
                      <span className="review-user-name">{review.userName}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`star ${star <= review.rating ? 'filled' : 'empty'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="review-title">{review.title}</div>
                  <div className="review-comment">{review.comment}</div>

                  {review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="review-image"
                        />
                      ))}
                    </div>
                  )}

                  <div className="review-footer">
                    <button
                      className={`btn btn-sm btn-link ${review.isHelpful ? 'active' : ''}`}
                      onClick={() => {
                        // Toggle helpful vote
                        alert('Helpful vote toggled!');
                      }}
                    >
                      Helpful ({review.helpfulCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-pane">
            <h2>Product Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{category}</span>
              </div>
              {subcategory && (
                <div className="detail-item">
                <span className="detail-label">Subcategory:</span>
                <span className="detail-value">{subcategory}</span>
              </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Grade Level:</span>
                <span className="detail-value">{gradeLevel}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Exam Year:</span>
                <span className="detail-value">{examYear}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Format:</span>
                <span className="detail-value">{format}</span>
              </div>
              {pages && (
                <div className="detail-item">
                <span className="detail-label">Pages:</span>
                <span className="detail-value">{pages}</span>
              </div>
              )}
              {fileSize && (
                <div className="detail-item">
                <span className="detail-label">File Size:</span>
                <span className="detail-value">{fileSize}</span>
              </div>
              )}
              {publisher && (
                <div className="detail-item">
                <span className="detail-label">Publisher:</span>
                <span className="detail-value">{publisher}</span>
              </div>
              )}
              {publicationDate && (
                <div className="detail-item">
                <span className="detail-label">Publication Date:</span>
                <span className="detail-value">{new Date(publicationDate).toLocaleDateString()}</span>
              </div>
              )}
              {language && (
                <div className="detail-item">
                <span className="detail-label">Language:</span>
                <span className="detail-value">{language}</span>
              </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Digital Download:</span>
                <span className="detail-value">{isDigital ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Physical Copy:</span>
                <span className="detail-value">{isPhysical ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Stock:</span>
                <span className="detail-value">{stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">SKU:</span>
                <span className="detail-value">{sku}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vendor:</span>
                <span className="detail-value">{vendor}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <RelatedProducts productId={productId} />
    </div>
  );
};

export default ProductDetailPage;