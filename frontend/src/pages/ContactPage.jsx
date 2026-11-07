import Navbar from '../components/Navbar';

export default function ContactPage() {
  return (
    <div className="site-shell">
      <header className="welcome-banner">
        <h1>MODS&apos;ZONE</h1>
        <p>Contact us for support and inquiries</p>
      </header>

      <Navbar />

      <div className="contact-page">
        <div className="contact-card">
          <h2>Contact Us</h2>
          <p className="contact-intro">We&apos;re here to help with account support, downloads, and general questions.</p>

          <div className="contact-list">
            <div className="contact-item">
              <span className="label">Email</span>
              <span className="value">your-email@example.com</span>
            </div>
            <div className="contact-item">
              <span className="label">Phone</span>
              <span className="value">+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <span className="label">Location</span>
              <span className="value">Worldwide Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
