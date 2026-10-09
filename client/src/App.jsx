import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Chatbot from './components/Chatbot';
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
import RelatedProducts from './components/RelatedProducts';
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

function HomePage() {
  return (
    <main className="page-shell">
      <header className="hero">
        <nav className="topbar">
          <div className="brand">EduMart</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/catalog">Catalog</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/profile">Profile</Link>
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
  return (
    <div className="page-shell">
      <h1>Catalog</h1>
      <p>Search, filter, and compare learning resources.</p>

      {/* Search bar */}
      <div className="catalog-search">
        <input
          type="text"
          placeholder="Search for subjects, grades, exam years..."
          className="search-input"
        />
        <button className="btn btn-primary">Search</button>
      </div>

      {/* Quick category links */}
      <div className="catalog-categories">
        <h2>Browse by Category</h2>
        <div className="category-list">
          <Link to="/category/mathematics" className="category-link">Mathematics</Link>
          <Link to="/category/biology" className="category-link">Biology</Link>
          <Link to="/category/chemistry" className="category-link">Chemistry</Link>
          <Link to="/category/physics" className="category-link">Physics</Link>
          <Link to="/category/english" className="category-link">English</Link>
          <Link to="/category/history" className="category-link">History</Link>
        </div>
      </div>

      {/* Featured products */}
      <div className="catalog-featured">
        <h2>Featured Resources</h2>
        <div className="featured-products">
          {/* Product cards would go here in a real implementation */}
          <div className="placeholder-product">
            <div className="product-placeholder">Featured Product 1</div>
          </div>
          <div className="placeholder-product">
            <div className="product-placeholder">Featured Product 2</div>
          </div>
          <div className="placeholder-product">
            <div className="product-placeholder">Featured Product 3</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  return <div className="page-shell"><h1>Cart</h1><p>Review items, apply coupons, and continue to checkout.</p></div>;
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
