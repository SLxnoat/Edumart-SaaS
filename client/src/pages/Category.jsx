import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../components/Category.css';

const CategoryPage = () => {
  const { categoryId, categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('featured'); // featured, price-low, price-high, rating, newest
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch(`/api/categories/${categoryId}/products?sort=${sortBy}`, { credentials: 'include' });

        // For now, we'll simulate with placeholder data that matches expected structure
        // This data would normally come from the backend
        const mockProducts = [
          {
            id: 'PROD-001',
            name: 'Algebra 1 Past Papers Bundle',
            price: 29.99,
            originalPrice: 39.99,
            discount: 25,
            rating: 4.8,
            reviewCount: 124,
            thumbnail: '/placeholder-product-1.jpg',
            isNew: false,
            isFeatured: true
          },
          {
            id: 'PROD-002',
            name: 'Biology Revision Notes',
            price: 19.99,
            rating: 4.5,
            reviewCount: 89,
            thumbnail: '/placeholder-product-2.jpg',
            isNew: true,
            isFeatured: false
          },
          {
            id: 'PROD-003',
            name: 'Chemistry Exam Practice',
            price: 24.99,
            originalPrice: 29.99,
            discount: 17,
            rating: 4.2,
            reviewCount: 67,
            thumbnail: '/placeholder-product-3.jpg',
            isNew: false,
            isFeatured: false
          },
          {
            id: 'PROD-004',
            name: 'Physics Formulas Sheet',
            price: 9.99,
            rating: 4.6,
            reviewCount: 156,
            thumbnail: '/placeholder-product-4.jpg',
            isNew: false,
            isFeatured: true
          },
          {
            id: 'PROD-005',
            name: 'English Literature Study Guide',
            price: 14.99,
            rating: 4.3,
            reviewCount: 78,
            thumbnail: '/placeholder-product-5.jpg',
            isNew: true,
            isFeatured: false
          },
          {
            id: 'PROD-006',
            name: 'Math Problem Solving Workbook',
            price: 22.99,
            rating: 4.7,
            reviewCount: 103,
            thumbnail: '/placeholder-product-6.jpg',
            isNew: false,
            isFeatured: false
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sort products based on sortBy state
        let sortedProducts = [...mockProducts];
        if (sortBy === 'price-low') {
          sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price-high') {
          sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'rating') {
          sortedProducts.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'newest') {
          sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } // featured/default remains as is (featured items first)

        setProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load category products');
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId, sortBy]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="category-loading">
          <div className="category-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>{categoryName || 'Category'}</h1>
          </div>
          <div className="category-content">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="category-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>{categoryName || 'Category'}</h1>
        </div>
        <div className="category-content">
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

  // If no products
  if (products.length === 0) {
    return (
      <div className="page-shell">
        <div className="category-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>{categoryName || 'Category'}</h1>
        </div>
        <div className="category-content">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-title">No products found in this category</p>
            <p className="empty-state-description">
              It looks like there are no products available in this category right now.
              Please check back later or browse other categories.
            </p>
            <Link to="/catalog" className="btn btn-outline">
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="category-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>{categoryName}</h1>
        <p className="category-subtitle">Browse {categoryName.toLowerCase()} learning resources</p>
      </div>

      {/* Filters and Sorting */}
      <div className="category-filters">
        <div className="sort-select">
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Button (for pagination in real implementation) */}
      <div className="load-more-container">
        <button className="btn btn-outline">
          Load More Products
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;