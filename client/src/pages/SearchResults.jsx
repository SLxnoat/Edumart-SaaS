import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../api';
import '../components/SearchResults.css';

const PAGE_SIZE = 12;

const DEFAULT_FILTERS = {
  subject: '',
  grade: '',
  examYear: '',
  format: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'relevance', // relevance, price-low, price-high, rating, newest
};

const filtersFromParams = (params) => ({
  subject: params.get('subject') || '',
  grade: params.get('grade') || '',
  examYear: params.get('examYear') || '',
  format: params.get('format') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  sortBy: params.get('sortBy') || 'relevance',
});

const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [filters, setFilters] = useState(() => filtersFromParams(new URLSearchParams(location.search)));
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-sync filters when the URL changes (e.g. a new search from the catalog page)
  useEffect(() => {
    setFilters(filtersFromParams(new URLSearchParams(location.search)));
    setPage(1);
  }, [location.search]);

  // Fetch results whenever the query, filters or page change (debounced for typing in price fields)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (query) qs.set('q', query);
        ['subject', 'grade', 'examYear', 'format', 'minPrice', 'maxPrice'].forEach((key) => {
          if (filters[key] !== '') qs.set(key, filters[key]);
        });
        qs.set('sort', filters.sortBy);
        qs.set('page', page);
        qs.set('limit', PAGE_SIZE);
        const data = await apiFetch(`/api/search?${qs.toString()}`);
        if (cancelled) return;
        setProducts((prev) => (page === 1 ? data.products : [...prev, ...data.products]));
        setTotal(data.count);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load search results');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, filters, page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sortBy: e.target.value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  let resultsContent;
  if (error) {
    resultsContent = (
      <div className="alert alert-error">
        {error}
        <button className="btn btn-sm btn-link" onClick={() => setError(null)}>×</button>
      </div>
    );
  } else if (loading && page === 1) {
    resultsContent = (
      <div className="search-content">
        <div className="loading-spinner"></div>
        <p>Searching for products...</p>
      </div>
    );
  } else if (products.length === 0) {
    resultsContent = (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <p className="empty-state-title">No results found</p>
        <p className="empty-state-description">
          Try adjusting your search terms or filters to find what you&apos;re looking for.
        </p>
        <div className="empty-state-actions">
          <Link to="/catalog" className="btn btn-outline">Browse All Products</Link>
          <button className="btn btn-outline" onClick={handleResetFilters}>Reset Filters</button>
        </div>
      </div>
    );
  } else {
    resultsContent = (
      <>
        <div className="results-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length < total && (
          <div className="load-more-container">
            <button className="btn btn-outline" disabled={loading} onClick={() => setPage((p) => p + 1)}>
              {loading ? 'Loading...' : 'Load More Results'}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="page-shell">
      <div className="search-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>{query ? <>Search Results for &quot;{query}&quot;</> : 'All Products'}</h1>
        <p className="search-subtitle">
          {loading && page === 1 ? 'Searching...' : `Found ${total} product${total === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Subject</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="subject"
                  value="Mathematics"
                  checked={filters.subject === 'Mathematics'}
                  onChange={handleFilterChange}
                />
                Mathematics
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="subject"
                  value="Biology"
                  checked={filters.subject === 'Biology'}
                  onChange={handleFilterChange}
                />
                Biology
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="subject"
                  value="Chemistry"
                  checked={filters.subject === 'Chemistry'}
                  onChange={handleFilterChange}
                />
                Chemistry
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="subject"
                  value="Physics"
                  checked={filters.subject === 'Physics'}
                  onChange={handleFilterChange}
                />
                Physics
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="subject"
                  value="English"
                  checked={filters.subject === 'English'}
                  onChange={handleFilterChange}
                />
                English
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="subject"
                  value="History"
                  checked={filters.subject === 'History'}
                  onChange={handleFilterChange}
                />
                History
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Grade Level</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="grade"
                  value="Grade 8"
                  checked={filters.grade === 'Grade 8'}
                  onChange={handleFilterChange}
                />
                Grade 8
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="grade"
                  value="Grade 9"
                  checked={filters.grade === 'Grade 9'}
                  onChange={handleFilterChange}
                />
                Grade 9
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="grade"
                  value="Grade 10"
                  checked={filters.grade === 'Grade 10'}
                  onChange={handleFilterChange}
                />
                Grade 10
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="grade"
                  value="Grade 11"
                  checked={filters.grade === 'Grade 11'}
                  onChange={handleFilterChange}
                />
                Grade 11
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="grade"
                  value="Grade 12"
                  checked={filters.grade === 'Grade 12'}
                  onChange={handleFilterChange}
                />
                Grade 12
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Exam Year</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="examYear"
                  value="2021"
                  checked={filters.examYear === '2021'}
                  onChange={handleFilterChange}
                />
                2021
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="examYear"
                  value="2022"
                  checked={filters.examYear === '2022'}
                  onChange={handleFilterChange}
                />
                2022
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="examYear"
                  value="2023"
                  checked={filters.examYear === '2023'}
                  onChange={handleFilterChange}
                />
                2023
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="examYear"
                  value="2024"
                  checked={filters.examYear === '2024'}
                  onChange={handleFilterChange}
                />
                2024
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Format</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="format"
                  value="PDF"
                  checked={filters.format === 'PDF'}
                  onChange={handleFilterChange}
                />
                PDF
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="format"
                  value="ePub"
                  checked={filters.format === 'ePub'}
                  onChange={handleFilterChange}
                />
                ePub
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="format"
                  value="Print"
                  checked={filters.format === 'Print'}
                  onChange={handleFilterChange}
                />
                Print
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="format"
                  value="Video"
                  checked={filters.format === 'Video'}
                  onChange={handleFilterChange}
                />
                Video
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <div className="price-input-group">
                <label htmlFor="minPrice">Min</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <span className="price-separator">–</span>
              <div className="price-input-group">
                <label htmlFor="maxPrice">Max</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="filters-main">
          <div className="sort-bar">
            <label htmlFor="sortBy">Sort by:</label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            <button className="btn btn-outline" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {resultsContent}
    </div>
  );
};

export default SearchResultsPage;
