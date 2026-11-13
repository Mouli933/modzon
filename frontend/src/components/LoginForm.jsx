import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
        email: form.get('email').trim(),
        password: form.get('password'),
      });
      formElement.reset();

      const { gameSlug } = location.state || {};
      if (gameSlug) {
        navigate(`/pcgames/${encodeURIComponent(gameSlug)}`, {
          replace: true,
          state: {
            message: location.state?.downloadType === 'cheat-table'
              ? 'You are logged in. Select Download Cheat Table to continue.'
              : 'You are logged in. Select Download DLL Files to continue.',
          },
        });
        return;
      }

      const returnPath = location.state?.from?.pathname;
      navigate(returnPath?.startsWith('/') ? returnPath : '/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-box" id="loginBox">
      {location.state?.message && <p className="login-note" role="status">{location.state.message}</p>}
      {user ? (
        <>
          <h2>Welcome</h2>
          <p className="user-email">{user.email}</p>
          <p className="login-note">You are logged in and can access game files.</p>
          <Link to="/pcgames" className="create-account-link">Browse PC Games</Link>
        </>
      ) : (
        <>
          <h2>LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                maxLength="255"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="signup-link-row">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              state={location.state?.gameSlug
                ? {
                  gameSlug: location.state.gameSlug,
                  downloadType: location.state.downloadType,
                }
                : undefined}
              className="create-account-link"
            >
              Create Account
            </Link>
          </p>

          <p className="login-note">Login to access exclusive MOD content</p>
        </>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
