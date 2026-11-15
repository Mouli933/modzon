import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowIcon, BookIcon, FolderIcon, TableFileIcon } from '../components/icons';
import { fadeUp, inView, stagger } from '../components/motionPresets';
import PageShell from '../components/PageShell';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';

const platformFeatures = [
  {
    Icon: BookIcon,
    title: 'Game-Specific Resources',
    description: 'Find resources organised for individual games.',
  },
  {
    Icon: TableFileIcon,
    title: 'Cheat Tables (.CT)',
    description: 'Access available game-specific cheat tables.',
  },
  {
    Icon: FolderIcon,
    title: 'DLL Files',
    description: 'Access available game files through the authenticated repository integration.',
  },
];

const steps = [
  ['01', 'Explore Games', 'Browse the available game catalogue.'],
  ['02', 'Create an Account / Login', 'Sign in when you want to access protected downloads.'],
  ['03', 'Access Game Files', 'Download available cheat tables or visit the corresponding DLL repository.'],
];

const posterFloat = (index) => ({
  y: [0, index === 0 ? -14 : -9, 0],
  transition: { duration: 6 + index * 1.3, repeat: Infinity, ease: 'easeInOut' },
});

export default function HomePage() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [gamesError, setGamesError] = useState('');

  // --- Existing data logic (unchanged) -------------------------------------
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
  // -------------------------------------------------------------------------

  const posters = featuredGames.slice(0, 3);

  return (
    <PageShell className="home-page">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="hero" aria-labelledby="home-hero-title">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-grid" />
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="hero-scan" />
        </div>

        <motion.div
          className="hero-copy"
          variants={stagger(0.11, 0.15)}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={fadeUp} className="eyebrow">
            <span className="pulse-dot" /> YOUR GAME MODS HUB
          </motion.p>
          <motion.h1 variants={fadeUp} id="home-hero-title">
            LEVEL UP
            <span className="hero-title-accent">YOUR GAME.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="hero-intro">
            Discover game-specific cheat tables, game resources and downloadable files
            for your favourite PC games.
          </motion.p>
          <motion.div variants={fadeUp} className="hero-actions">
            <Link to="/pcgames" className="btn btn-primary">
              Explore Games <ArrowIcon />
            </Link>
            <a href="#featured-games" className="btn btn-ghost">Discover Mods</a>
          </motion.div>
          <motion.ul variants={fadeUp} className="hero-chips" aria-label="What you get">
            <li>Cheat Tables (.CT)</li>
            <li>DLL Files</li>
            <li>Per-game catalogue</li>
          </motion.ul>
        </motion.div>

        <div className="hero-art" aria-hidden="true">
          <span className="hero-art-glow" />
          {posters.map((game, index) => (
            <motion.div
              key={game.slug}
              className={`hero-poster hero-poster-${index + 1}`}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35 + index * 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="hero-poster-float" animate={posterFloat(index)}>
                <img src={getGameImage(game.slug)} alt="" />
                <span className="hero-poster-label">{game.name}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------- FEATURED GAMES --------------------------- */}
      <section className="section" id="featured-games" aria-labelledby="featured-games-title">
        <motion.div
          className="section-head"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow">PICK YOUR NEXT ADVENTURE</motion.p>
            <motion.h2 variants={fadeUp} id="featured-games-title">Featured Games</motion.h2>
            <motion.p variants={fadeUp} className="section-description">
              Explore some of the games available on MODS&apos;ZONE.
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <Link to="/pcgames" className="text-link">View all games <ArrowIcon /></Link>
          </motion.div>
        </motion.div>

        {gamesError && <p className="form-error" role="alert">{gamesError}</p>}

        {!gamesError && featuredLoading ? (
          <div className="featured-grid" role="status" aria-label="Loading featured games">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="skeleton-card" key={index}>
                <span className="skeleton skeleton-img" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        ) : !gamesError && featuredGames.length === 0 ? (
          <p className="empty-note" role="status">No games are available right now.</p>
        ) : (
          <motion.div
            className="featured-grid"
            variants={stagger(0.09)}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            {featuredGames.map((game, index) => (
              <motion.div
                key={game.slug}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <Link
                  to={`/pcgames/${encodeURIComponent(game.slug)}`}
                  className="featured-card glow-card"
                  aria-label={`Explore ${game.name}`}
                >
                  <span className="featured-media">
                    <img src={getGameImage(game.slug)} alt="" loading="lazy" decoding="async" />
                    <span className="featured-index">{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="featured-info">
                    <span className="featured-label">GAME RESOURCES</span>
                    <span className="featured-name">{game.name}</span>
                    <span className="featured-explore">
                      Explore <ArrowIcon />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ------------------------------ WHY ------------------------------ */}
      <section className="section" aria-labelledby="why-title">
        <motion.div
          className="section-head center"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow">BUILT AROUND YOUR GAMES</motion.p>
            <motion.h2 variants={fadeUp} id="why-title">Why MODS&apos;ZONE</motion.h2>
          </div>
        </motion.div>
        <motion.div
          className="feature-grid"
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
        >
          {platformFeatures.map(({ Icon, title, description }) => (
            <motion.article key={title} className="glass-card feature-card" variants={fadeUp} whileHover={{ y: -6 }}>
              <span className="icon-tile"><Icon /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ------------------------------ HOW ------------------------------ */}
      <section className="section" aria-labelledby="how-title">
        <motion.div
          className="section-head center"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow">THREE SIMPLE STEPS</motion.p>
            <motion.h2 variants={fadeUp} id="how-title">How It Works</motion.h2>
          </div>
        </motion.div>
        <motion.ol
          className="steps-grid"
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
        >
          {steps.map(([number, title, description]) => (
            <motion.li key={number} className="glass-card step-card" variants={fadeUp}>
              <span className="step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* ------------------------------ CTA ------------------------------ */}
      <motion.section
        className="cta-panel"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inView}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="cta-glow" aria-hidden="true" />
        <p className="eyebrow">YOUR NEXT GAME STARTS HERE</p>
        <h2>Ready to explore?</h2>
        <p className="section-description">
          Find your favourite games and discover their available resources.
        </p>
        <Link to="/pcgames" className="btn btn-primary">
          Explore All Games <ArrowIcon />
        </Link>
      </motion.section>
    </PageShell>
  );
}
