import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      await signup({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        confirmPassword: form.get('confirmPassword'),
      });
      navigate('/', { state: { message: 'Account created successfully. Please log in.' } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="welcome-banner">
        <h1>MODS&apos;ZONE</h1>
        <p>Create your account to unlock MODs</p>
      </header>

      <div className="signup-wrapper">
        <div className="signup-box">
          <h2>CREATE ACCOUNT</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signupName">Full Name</label>
              <input id="signupName" name="name" type="text" placeholder="Your Name" autoComplete="name" maxLength="100" required />
            </div>

            <div className="form-group">
              <label htmlFor="signupEmail">Email</label>
              <input id="signupEmail" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <input id="signupPassword" name="password" type="password" placeholder="At least 12 characters" autoComplete="new-password" minLength="12" required />
            </div>

            <div className="form-group">
              <label htmlFor="signupConfirmPassword">Confirm Password</label>
              <input id="signupConfirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" autoComplete="new-password" minLength="12" required />
            </div>

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="extra-links">
            <p>
              Already have an account? <Link to="/">Login</Link>
            </p>
            <p>
              <Link to="/">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
