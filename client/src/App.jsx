import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import ProductCard from './components/ProductCard';
import { apiFetch } from './api';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ProfilePage from './pages/Profile';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import VerifyEmailPage from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';
import Category from './pages/Category';
import SearchResults from './pages/SearchResults';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import OrderConfirmationPage from './pages/OrderConfirmation';
import OrderHistoryPage from './pages/OrderHistory';
import OrderDetailPage from './pages/OrderDetail';
import MiniCart from './components/MiniCart';
import './components/SellerDashboard.css';
import './components/AdminDashboard.css';
import './components/Notifications.css';
import './components/Reviews.css';
import './components/ProductCard.css';
import './components/Category.css';
import './components/SearchResults.css';
import './components/ProductDetail.css';
import './components/RelatedProducts.css';
import './components/Wishlist.css';
import './components/Cart.css';

function HomePage() {
  return (
    <main className="page-shell">
      <header className="hero">
        <nav className="topbar">
          <div className="brand"><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>EduMart</Link></div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/">Home</Link>
            <Link to="/catalog">Catalog</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/profile">Profile</Link>
            <MiniCart />
          </div>
        </nav>

        <section className="hero-content">
          <p className="eyebrow">Study smarter</p>
          <h1>Buy and sell quality learning materials</h1>
          <p>
            Explore past papers, notes, revision packs, e-books, and digital resources from
            trusted tutors and students.
          </p>
          <div className="hero-actions">
            <button className="primary">Explore catalog</button>
            <button className="secondary">Become a seller</button>
          </div>
        </section>
      </header>

      <section className="feature-grid">
        <article className="card">
          <h3>Study Catalog</h3>
          <p>Browse by subject, grade, exam year, and format.</p>
        </article>
        <article className="card">
          <h3>Secure Checkout</h3>
          <p>Fast and trustworthy purchases across multiple learning materials.</p>
        </article>
        <article className="card">
          <h3>Smart Support</h3>
          <p>AI-powered chatbot assistance for FAQs and order tracking.</p>
        </article>
      </section>
    </main>
  );
}

function CatalogPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch('/api/categories/browse'), apiFetch('/api/materials/featured?limit=6')])
      .then(([cats, feat]) => {
        if (cancelled) return;
        setCategories(cats.categories);
        setFeatured(feat.products);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load catalog');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };
  return (
    <div className="page-shell">
      <h1>Catalog</h1>
      <p>Search, filter, and compare learning resources.</p>

      {/* Search bar */}
      <form className="catalog-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for subjects, grades, exam years..."
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Quick category links */}
      <div className="catalog-categories">
        <h2>Browse by Category</h2>
        <div className="category-list">
          {categories.map((c) => (
            <Link key={c.id} to={`/category/${c.id}`} className="category-link">{c.name}</Link>
          ))}
        </div>
      </div>

      {/* Featured products */}
      <div className="catalog-featured">
        <h2>Featured Resources</h2>
        {loadError && <p className="alert alert-error">{loadError}</p>}
        <div className="featured-products">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder pages for future implementation
const PlaceholderPage = ({ title, description }) => (
  <div className="page-shell">
    <h1>{title}</h1>
    <p>{description}</p>
    <p><em>This page is under development.</em></p>
  </div>
);

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        {/* Product Discovery Routes */}
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/category/:categoryId?" element={<Category />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/wishlist" element={<Wishlist />}/>

        {/* Placeholder routes for other features */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reviews" element={<Reviews />}/>
        <Route path="/resend-verification" element={<ResendVerification />}/>
        {/* Catch-all route for 404 */}
        <Route path="*" element={<PlaceholderPage title="Page Not Found" description="The page you're looking for doesn't exist." />} />
      </Routes>
      <Chatbot />
    </>
  );
}
