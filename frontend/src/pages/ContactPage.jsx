import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!form.get('email').trim() || !form.get('comment').trim()) {
      setError('Please enter both your email and comment.');
      setSubmitted(false);
      return;
    }

    setError('');
    setSubmitted(true);
  }

  function clearMessages() {
    setError('');
    setSubmitted(false);
  }

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
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contactEmail">Email</label>
              <input
                id="contactEmail"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={clearMessages}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactComment">Comment</label>
              <textarea
                id="contactComment"
                name="comment"
                rows="5"
                required
                onChange={clearMessages}
              />
            </div>
            <button type="submit" className="primary-button">Submit</button>
          </form>
          {error && <p className="form-error" role="alert">{error}</p>}
          {submitted && (
            <p className="contact-intro" role="status">
              Your form is complete. Message delivery has not been configured.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
