import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';

const platformFeatures = [
  {
    icon: 'resources',
    title: 'Game-Specific Resources',
    description: 'Find resources organised for individual games.',
  },
  {
    icon: 'table',
    title: 'Cheat Tables (.CT)',
    description: 'Access available game-specific cheat tables.',
  },
  {
    icon: 'files',
    title: 'DLL Files',
    description: 'Access available game files through the authenticated repository integration.',
  },
];

const steps = [
  ['01', 'EXPLORE GAMES', 'Browse the available game catalogue.'],
  ['02', 'CREATE AN ACCOUNT / LOGIN', 'Sign in when you want to access protected downloads.'],
  ['03', 'ACCESS GAME FILES', 'Download available cheat tables or visit the corresponding DLL repository.'],
];

function FeatureIcon({ name }) {
  const paths = {
    resources: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h8',
    table: 'M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h8',
    files: 'M4 7h6l2 2h8v11H4V7Zm3-4h6l2 2h4',
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-feature-icon">
      <path d={paths[name]} />
    </svg>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const [featuredGames, setFeaturedGames] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [gamesError, setGamesError] = useState('');
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let active = true;
    getAvailableGames()
      .then((games) => {
        if (active) {
          setFeaturedGames(games.slice(0, 6));
        }
      })
      .catch((error) => {
        if (active) {
          setGamesError(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setFeaturedLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.home-page [data-reveal]');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [featuredLoading]);

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <div className="site-shell">
      <Navbar />

      <main className="home-page">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero-copy">
            <p className="home-eyebrow">YOUR GAME MODS HUB</p>
            <h1 id="home-hero-title">WELCOME TO MODS&apos;ZONE</h1>
            <h2>Explore Your Games. Unlock New Possibilities.</h2>
            <p className="home-intro">
              Discover game-specific cheat tables, game resources and downloadable files
              for your favourite PC games.
            </p>
            <div className="home-actions">
              <Link to="/pcgames" className="home-primary-link">EXPLORE GAMES</Link>
              <a href="#featured-games" className="home-secondary-link">DISCOVER MODS</a>
            </div>
            {user && (
              <div className="home-account">
                <span>Signed in as {user.email}</span>
                <button type="button" className="home-logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
            {logoutError && <p className="form-error" role="alert">{logoutError}</p>}
          </div>

          <div className="home-hero-art" aria-hidden="true">
            {featuredGames.slice(0, 3).map((game, index) => (
              <div className={`hero-poster hero-poster-${index + 1}`} key={game.slug}>
                <img src={getGameImage(game.slug)} alt="" />
              </div>
            ))}
            <span className="hero-glow" />
            <span className="hero-status">MODS&apos;ZONE // GAME FILES</span>
          </div>
        </section>

        <section
          className="featured-section home-reveal"
          id="featured-games"
          aria-labelledby="featured-games-title"
          data-reveal
        >
          <div className="featured-heading">
            <div>
              <p className="home-eyebrow">PICK YOUR NEXT ADVENTURE</p>
              <h2 id="featured-games-title">FEATURED GAMES</h2>
              <p className="section-description">Explore some of the games available on MODS&apos;ZONE.</p>
            </div>
            <Link to="/pcgames" className="featured-all-link">View all games →</Link>
          </div>
          {gamesError && <p className="form-error" role="alert">{gamesError}</p>}
          {!gamesError && featuredLoading ? (
            <p className="login-note" role="status">Loading featured games...</p>
          ) : !gamesError && featuredGames.length === 0 ? (
            <p className="login-note" role="status">No games are available right now.</p>
          ) : (
            <div className="featured-grid">
              {featuredGames.map((game, index) => (
                <Link
                  key={game.slug}
                  to={`/pcgames/${encodeURIComponent(game.slug)}`}
                  className="featured-game-card"
                  data-reveal
                  style={{ '--reveal-order': index }}
                >
                  <span className="featured-image-frame">
                    <img src={getGameImage(game.slug)} alt="" />
                  </span>
                  <span className="featured-game-info">
                    <span className="featured-game-label">GAME RESOURCES</span>
                    <span className="featured-game-name">{game.name}</span>
                    <span className="featured-explore">EXPLORE <span aria-hidden="true">↗</span></span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="discover-section home-reveal" data-reveal>
          <div>
            <p className="home-eyebrow">THE FULL COLLECTION</p>
            <h2>Discover More Games</h2>
            <p>Explore our complete collection of available PC games and game-specific resources.</p>
          </div>
          <Link to="/pcgames" className="home-primary-link">VIEW ALL GAMES</Link>
        </section>

        <section className="why-section home-reveal" aria-labelledby="why-title" data-reveal>
          <div className="section-title-block">
            <p className="home-eyebrow">BUILT AROUND YOUR GAMES</p>
            <h2 id="why-title">Why MODS&apos;ZONE</h2>
          </div>
          <div className="why-grid">
            {platformFeatures.map((feature) => (
              <article className="why-card" key={feature.title}>
                <span className="home-feature-icon-wrap"><FeatureIcon name={feature.icon} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="how-section home-reveal" aria-labelledby="how-title" data-reveal>
          <div className="section-title-block">
            <p className="home-eyebrow">THREE SIMPLE STEPS</p>
            <h2 id="how-title">How It Works</h2>
          </div>
          <div className="steps-grid">
            {steps.map(([number, title, description]) => (
              <article className="step-card" key={number}>
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-cta home-reveal" data-reveal>
          <p className="home-eyebrow">YOUR NEXT GAME STARTS HERE</p>
          <h2>READY TO EXPLORE?</h2>
          <p>Find your favourite games and discover their available resources.</p>
          <Link to="/pcgames" className="home-primary-link">EXPLORE ALL GAMES</Link>
        </section>
      </main>
    </div>
  );
}
