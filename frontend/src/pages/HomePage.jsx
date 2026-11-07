import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isLoading, sessionError, login, logout } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await login({
        email: form.get('email'),
        password: form.get('password'),
      });
      formElement.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="site-shell">
      <header className="welcome-banner">
        <h1>WELCOME TO MODS&apos;ZONE</h1>
        <p>Download Free Modded APKs of Popular Games and Apps</p>
      </header>

      <Navbar />

      <div className="login-wrapper">
        <div className="login-box" id="loginBox">
          {location.state?.message && <p className="login-note" role="status">{location.state.message}</p>}
          {sessionError && <p className="form-error" role="alert">{sessionError}</p>}
          {isLoading ? (
            <p className="login-note">Checking your session...</p>
          ) : user ? (
            <>
              <h2>Welcome</h2>
              <p className="user-email">{user.email}</p>
              <button type="button" className="primary-button" onClick={handleLogout}>Logout</button>
              <p className="login-note">You can now browse and download modded content.</p>
            </>
          ) : (
            <>
              <h2>LOGIN</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="loginEmail">Email</label>
                  <input id="loginEmail" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                </div>

                <div className="form-group">
                  <label htmlFor="loginPassword">Password</label>
                  <input id="loginPassword" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
                </div>

                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="signup-link-row">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="create-account-link">Create Account</Link>
              </p>

              <p className="login-note">Login to access exclusive MOD content</p>
            </>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}
