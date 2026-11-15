import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';
import { ChevronIcon, CloseIcon, MenuIcon } from './icons';

function NavItem({ to, active, layoutId, children }) {
  return (
    <Link
      to={to}
      className={`nav-link${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <span>{children}</span>
      {active && (
        <motion.span
          layoutId={layoutId}
          className="nav-indicator"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [games, setGames] = useState([]);
  const [gamesError, setGamesError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  // --- Existing data logic (unchanged) -------------------------------------
  useEffect(() => {
    let active = true;
    getAvailableGames()
      .then((availableGames) => {
        if (active) {
          setGames(availableGames);
        }
      })
      .catch((error) => {
        if (active) {
          setGamesError(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleTriggerClick(event) {
    event.preventDefault();
    if (window.matchMedia('(hover: none)').matches || event.detail === 0) {
      setDropdownOpen((open) => !open);
    } else {
      setDropdownOpen(true);
    }
  }
  // -------------------------------------------------------------------------

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!logoutError) return undefined;
    const timer = setTimeout(() => setLogoutError(''), 5000);
    return () => clearTimeout(timer);
  }, [logoutError]);

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  const onHome = pathname === '/';
  const onGames = pathname.startsWith('/pcgames');
  const onContact = pathname.startsWith('/contact');

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
      <nav className="navbar-inner" aria-label="Primary">
        <Link to="/" className="brand" aria-label="MODS'ZONE home">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">MODS<b>&apos;</b>ZONE</span>
        </Link>

        <div className="navbar-items">
          <NavItem to="/" active={onHome} layoutId="nav-indicator">Home</NavItem>

          <div
            className="games-dropdown"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setDropdownOpen(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') setDropdownOpen(false);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setDropdownOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setDropdownOpen(false);
            }}
          >
            <button
              type="button"
              className={`nav-link nav-trigger${onGames ? ' is-active' : ''}`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              onClick={handleTriggerClick}
            >
              <span>PC Games</span>
              <ChevronIcon className={`chevron${dropdownOpen ? ' is-open' : ''}`} />
              {onGames && (
                <motion.span
                  layoutId="nav-indicator"
                  className="nav-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="games-dropdown-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <div className="games-dropdown-panel">
                    <Link to="/pcgames" className="dropdown-all" onClick={() => setDropdownOpen(false)}>
                      All PC Games <span aria-hidden="true">→</span>
                    </Link>
                    {gamesError ? (
                      <span className="games-dropdown-message">{gamesError}</span>
                    ) : (
                      <div className="dropdown-list">
                        {games.map((game) => (
                          <Link
                            key={game.slug}
                            to={`/pcgames/${encodeURIComponent(game.slug)}`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <img src={getGameImage(game.slug)} alt="" loading="lazy" />
                            <span>{game.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavItem to="/contact" active={onContact} layoutId="nav-indicator">Contact</NavItem>
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <span className="nav-user" title={user?.email}>{user?.email}</span>
              <button type="button" className="nav-btn nav-btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-ghost">Login</Link>
              <Link to="/signup" className="nav-btn nav-btn-solid">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-burger"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mobile-menu-inner">
              <Link to="/" className={onHome ? 'is-active' : ''}>Home</Link>
              <Link to="/pcgames" className={onGames ? 'is-active' : ''}>PC Games</Link>
              <Link to="/contact" className={onContact ? 'is-active' : ''}>Contact</Link>
              <div className="mobile-menu-auth">
                {isAuthenticated ? (
                  <>
                    <span className="nav-user">{user?.email}</span>
                    <button type="button" className="nav-btn nav-btn-ghost" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-btn nav-btn-ghost">Login</Link>
                    <Link to="/signup" className="nav-btn nav-btn-solid">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logoutError && (
          <motion.p
            className="nav-toast"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {logoutError}
          </motion.p>
        )}
      </AnimatePresence>
    </header>
  );
}
