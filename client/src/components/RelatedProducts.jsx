import React from 'react';
import ProductCard from './ProductCard';
import './RelatedProducts.css';

const RelatedProducts = ({ productId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real implementation, we would fetch related products based on category
  // For now, we'll use mock data
  React.useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API like:
        // const response = await fetch(`/api/products/related?productId=${productId}&category=${category}`, { credentials: 'include' });

        // For now, we'll simulate with placeholder data
        const mockRelatedProducts = [
          {
            id: 'REL-001',
            name: 'Geometry Practice Worksheets',
            price: 19.99,
            rating: 4.3,
            reviewCount: 67,
            thumbnail: '/placeholder-related-1.jpg',
            isNew: true,
            isFeatured: false
          },
          {
            id: 'REL-002',
            name: 'Algebra 2 Formula Sheet',
            price: 9.99,
            rating: 4.6,
            reviewCount: 89,
            thumbnail: '/placeholder-related-2.jpg',
            isNew: false,
            isFeatured: true
          },
          {
            id: 'REL-003',
            name: 'Trigonometry Basics Guide',
            price: 14.99,
            rating: 4.4,
            reviewCount: 56,
            thumbnail: '/placeholder-related-3.jpg',
            isNew: false,
            isFeatured: false
          },
          {
            id: 'REL-004',
            name: 'Pre-Calculus Problems',
            price: 24.99,
            originalPrice: 29.99,
            discount: 17,
            rating: 4.7,
            reviewCount: 103,
            thumbnail: '/placeholder-related-4.jpg',
            isNew: false,
            isFeatured: false
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        setRelatedProducts(mockRelatedProducts);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load related products');
        setLoading(false);
      }
    };

    if (productId && category) {
      fetchRelatedProducts();
    }
  }, [productId, category]);

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