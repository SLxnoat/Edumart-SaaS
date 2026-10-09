import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../api';
import '../components/Category.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('featured'); // featured, price-low, price-high, rating, newest
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const categoryName = category?.name || '';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!categoryId) {
          // /category without an id: browse all categories
          const data = await apiFetch('/api/categories/browse');
          if (cancelled) return;
          setCategories(data.categories);
          setCategory(null);
          setProducts([]);
        } else {
          const data = await apiFetch(`/api/categories/${encodeURIComponent(categoryId)}/products?sort=${sortBy}`);
          if (cancelled) return;
          setCategory(data.category);
          setProducts(data.products);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.status === 404 ? 'Category not found' : err.message || 'Failed to load category products');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
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

  // Category browsing page (no category selected)
  if (!categoryId) {
    return (
      <div className="page-shell">
        <div className="category-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Browse by Category</h1>
          <p className="category-subtitle">Pick a subject to explore learning resources</p>
        </div>
        <div className="category-list">
          {categories.map((c) => (
            <Link key={c.id} to={`/category/${c.id}`} className="category-link">
              {c.name} ({c.productCount})
            </Link>
          ))}
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
        <p className="category-subtitle">{category?.description || `Browse ${categoryName.toLowerCase()} learning resources`}</p>
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