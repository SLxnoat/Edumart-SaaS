import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../components/SearchResults.css';

const SearchResultsPage = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    examYear: '',
    format: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance' // relevance, price-low, price-high, rating, newest
  });

  useEffect(() => {
    // Extract query from location state or search params
    const searchParams = new URLSearchParams(location.search);
    const queryFromParams = searchParams.get('q') || '';
    setQuery(queryFromParams || 'search results');

    // Extract filters from search params
    const filtersFromParams = {
      subject: searchParams.get('subject') || '',
      grade: searchParams.get('grade') || '',
      examYear: searchParams.get('examYear') || '',
      format: searchParams.get('format') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'relevance'
    };
    setFilters(filtersFromParams);

    // Fetch search results
    fetchSearchResults();
  }, [location]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call an API like:
      // const response = await fetch(`/api/search?q=${query}&subject=${filters.subject}&grade=${filters.grade}&examYear=${filters.examYear}&format=${filters.format}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&sort=${filters.sortBy}`, { credentials: 'include' });

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
          isFeatured: true,
          subject: 'Mathematics',
          grade: 'Grade 9',
          examYear: '2023',
          format: 'PDF'
        },
        {
          id: 'PROD-002',
          name: 'Biology Revision Notes',
          price: 19.99,
          rating: 4.5,
          reviewCount: 89,
          thumbnail: '/placeholder-product-2.jpg',
          isNew: true,
          isFeatured: false,
          subject: 'Biology',
          grade: 'Grade 10',
          examYear: '2023',
          format: 'PDF'
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
          isFeatured: false,
          subject: 'Chemistry',
          grade: 'Grade 11',
          examYear: '2023',
          format: 'PDF'
        },
        {
          id: 'PROD-004',
          name: 'Physics Formulas Sheet',
          price: 9.99,
          rating: 4.6,
          reviewCount: 156,
          thumbnail: '/placeholder-product-4.jpg',
          isNew: false,
          isFeatured: true,
          subject: 'Physics',
          grade: 'Grade 12',
          examYear: '2023',
          format: 'PDF'
        },
        {
          id: 'PROD-005',
          name: 'English Literature Study Guide',
          price: 14.99,
          rating: 4.3,
          reviewCount: 78,
          thumbnail: '/placeholder-product-5.jpg',
          isNew: true,
          isFeatured: false,
          subject: 'English',
          grade: 'Grade 10',
          examYear: '2023',
          format: 'ePub'
        },
        {
          id: 'PROD-006',
          name: 'Math Problem Solving Workbook',
          price: 22.99,
          rating: 4.7,
          reviewCount: 103,
          thumbnail: '/placeholder-product-6.jpg',
          isNew: false,
          isFeatured: false,
          subject: 'Mathematics',
          grade: 'Grade 8',
          examYear: '2023',
          format: 'PDF'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter products based on filters state
      let filteredProducts = [...mockProducts];

      if (filters.subject) {
        filteredProducts = filteredProducts.filter(p => p.subject === filters.subject);
      }
      if (filters.grade) {
        filteredProducts = filteredProducts.filter(p => p.grade === filters.grade);
      }
      if (filters.examYear) {
        filteredProducts = filteredProducts.filter(p => p.examYear === filters.examYear);
      }
      if (filters.format) {
        filteredProducts = filteredProducts.filter(p => p.format === filters.format);
      }
      if (filters.minPrice !== '') {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice !== '') {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(filters.maxPrice));
      }

      // Sort products based on sortBy state
      if (filters.sortBy === 'price-low') {
        filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (filters.sortBy === 'price-high') {
        filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (filters.sortBy === 'rating') {
        filteredProducts.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'newest') {
        filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } // relevance/default remains as is

      setProducts(filteredProducts);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load search results');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === 'checkbox') {
      newValue = checked;
    }

    setFilters(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({
      ...prev,
      sortBy: e.target.value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      subject: '',
      grade: '',
      examYear: '',
      format: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance'
    });
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-shell">
        <div className="search-loading">
          <div className="search-header">
            <Link to="/" className="btn btn-link">
              ← Back to Home
            </Link>
            <h1>Search Results for "{query}"</h1>
          </div>
          <div className="search-content">
            <div className="loading-spinner"></div>
            <p>Searching for products...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="page-shell">
        <div className="search-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Search Results for "{query}"</h1>
        </div>
        <div className="search-content">
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

  // If no results
  if (products.length === 0) {
    return (
      <div className="page-shell">
        <div className="search-header">
          <Link to="/" className="btn btn-link">
            ← Back to Home
          </Link>
          <h1>Search Results for "{query}"</h1>
          <p className="search-subtitle">No products found matching your search</p>
        </div>
        <div className="search-content">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-title">No results found</p>
            <p className="empty-state-description">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <div className="empty-state-actions">
              <Link to="/catalog" className="btn btn-outline">
                Browse All Products
              </Link>
              <button className="btn btn-outline" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="search-header">
        <Link to="/" className="btn btn-link">
          ← Back to Home
        </Link>
        <h1>Search Results for "{query}"</h1>
        <p className="search-subtitle">Found {products.length} products</p>
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

      {/* Results Grid */}
      <div className="results-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Button (for pagination in real implementation) */}
      <div className="load-more-container">
        <button className="btn btn-outline">
          Load More Results
        </button>
      </div>
    </div>
  );
};

export default SearchResultsPage;