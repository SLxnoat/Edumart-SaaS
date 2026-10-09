import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user's reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch('/api/user/reviews', { credentials: 'include' });
        // OR fetch all reviews and filter by current user (if endpoint supports)

        // For now, we'll simulate with placeholder data that matches expected structure
        // This data would normally come from the backend
        const mockReviews = [
          {
            id: 1,
            productId: 'PROD-001',
            productName: 'Algebra 1 Past Papers Bundle',
            rating: 5,
            title: 'Excellent resource!',
            comment: 'This bundle helped me ace my exams. The explanations are clear and the practice questions are spot-on.',
            images: [], // Array of image URLs if any
            createdAt: '2026-10-01T10:30:00Z',
            helpfulCount: 12,
            isHelpful: false, // Whether current user found this helpful
            canEdit: true, // Based on ownership
            canDelete: true
          },
          {
            id: 2,
            productId: 'PROD-002',
            productName: 'Biology Revision Notes',
            rating: 4,
            title: 'Good notes, missing some topics',
            comment: 'The notes are well-organized and easy to follow, but I wish they covered more advanced topics like genetics.',
            images: ['https://example.com/biology-note1.jpg'],
            createdAt: '2026-09-25T14:15:00Z',
            helpfulCount: 8,
            isHelpful: true,
            canEdit: true,
            canDelete: true
          },
          {
            id: 3,
            productId: 'PROD-003',
            productName: 'Chemistry Exam Practice',
            rating: 3,
            title: 'Average practice set',
            comment: 'The questions are okay but some answer keys seem incorrect. Needs improvement.',
            images: [],
            createdAt: '2026-09-20T09:45:00Z',
            helpfulCount: 3,
            isHelpful: false,
            canEdit: true,
            canDelete: true
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setReviews(mockReviews);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
        setLoading(false);
        // Redirect to login if not authenticated
        navigate('/login');
      }
    };

    fetchReviews();
  }, [navigate]);

  // Handle helpful vote
  const toggleHelpful = async (reviewId) => {
    try {
      // In a real implementation, this would call an API like:
      // await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST', credentials: 'include' });

      // For now, update optimistically
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? {
                ...review,
                helpfulCount: review.isHelpful ? review.helpfulCount - 1 : review.helpfulCount + 1,
                isHelpful: !review.isHelpful
              }
            : review
        )
      );
    } catch (err) {
      console.error('Failed to toggle helpful vote:', err);
      // Optionally show a toast or revert the optimistic update
    }
  };

  // Handle edit review
  const handleEditReview = (reviewId) => {
    // In a real app, this would navigate to an edit review page
    // For now, we'll just show an alert or navigate to a mock edit page
    alert(`Edit review functionality for review ID ${reviewId} would go here`);
    // Example navigation: navigate(`/reviews/edit/${reviewId}`);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      // In a real implementation, this would call an API like:
      // await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE', credentials: 'include' });

      // For now, remove from state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  // Handle write new review
  const handleWriteReview = () => {
    // In a real app, this would require product context
    // For now, we'll navigate to a placeholder or show a message
    alert('To write a new review, please visit a product page and use the review form there.');
    // Example: navigate to catalog to select a product
    navigate('/catalog');
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="reviews-loading">
          <div className="reviews-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>My Reviews</h1>
          </div>
          <div className="reviews-content">
            <div className="loading-spinner"></div>
            <p>Loading your reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="reviews-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>My Reviews</h1>
        </div>
        <div className="reviews-content">
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

  // If no reviews
  if (reviews.length === 0) {
    return (
      <div className="page-shell">
        <div className="reviews-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>My Reviews</h1>
          <p className="reviews-subtitle">Reviews you&apos;ve written for products</p>
        </div>
        <div className="reviews-content">
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p className="empty-state-title">You haven&apos;t written any reviews yet</p>
            <p className="empty-state-description">
              Share your experience with other students by writing reviews for products you&apos;ve purchased.
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
      <div className="reviews-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>My Reviews</h1>
        <p className="reviews-subtitle">Reviews you&apos;ve written for products</p>
      </div>

      {/* Actions Bar */}
      <div className="reviews-actions">
        <Link to="/catalog" className="btn btn-outline" onClick={handleWriteReview}>
          Write a new review
        </Link>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-product-info">
                <span className="review-product-name">{review.productName}</span>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="review-actions">
                {review.canEdit && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditReview(review.id)}
                  >
                    Edit
                  </button>
                )}
                {review.canDelete && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="review-content">
              <div className="review-rating">
                {/* Render star rating */}
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${star <= review.rating ? 'filled' : 'empty'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="review-rating-value"> ({review.rating}/5)</span>
              </div>

              <h3 className="review-title">{review.title}</h3>

              <div className="review-comment">
                {review.comment}
              </div>

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
                <div className="review-helpful">
                  <button
                    className={`btn btn-sm btn-link ${review.isHelpful ? 'active' : ''}`}
                    onClick={() => toggleHelpful(review.id)}
                  >
                    Helpful ({review.helpfulCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;