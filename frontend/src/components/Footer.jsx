import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand" aria-label="MODS'ZONE home">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">MODS<b>&apos;</b>ZONE</span>
          </Link>
          <p>Game-specific cheat tables and DLL resources for PC games.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/pcgames">PC Games</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} MODS&apos;ZONE. All rights reserved.
      </div>
    </footer>
  );
}
