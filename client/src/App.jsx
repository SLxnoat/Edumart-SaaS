import { Routes, Route, Link } from 'react-router-dom';
import Chatbot from './components/Chatbot';

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
  return <div className="page-shell"><h1>Catalog</h1><p>Search, filter, and compare learning resources.</p></div>;
}

function CartPage() {
  return <div className="page-shell"><h1>Cart</h1><p>Review items, apply coupons, and continue to checkout.</p></div>;
}

function ProfilePage() {
  return <div className="page-shell"><h1>Profile</h1><p>Manage account, orders, and seller dashboard.</p></div>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Chatbot />
    </>
  );
}
