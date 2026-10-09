import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { apiFetch } from '../api';
import './RelatedProducts.css';

const RelatedProducts = ({ productId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(`/api/materials/${encodeURIComponent(productId)}/related?limit=4`);
        if (!cancelled) setRelatedProducts(data.products);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load related products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (productId) {
      fetchRelatedProducts();
    }
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="related-products-loading">
        <div className="loading-spinner"></div>
        <p>Loading related products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="related-products-error">
        <p>{error}</p>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <div className="related-products-section">
      <h2>You May Also Like</h2>
      <div className="related-products-grid">
        {relatedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;