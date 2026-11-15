import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowIcon, CloseIcon, SearchIcon } from '../components/icons';
import { EASE, fadeUp, stagger } from '../components/motionPresets';
import PageShell from '../components/PageShell';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';

const rowVariants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function PCGamesPage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Existing data logic (unchanged) -------------------------------------
  useEffect(() => {
    let active = true;
    getAvailableGames()
      .then((availableGames) => {
        if (active) {
          setGames(availableGames);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredGames = games.filter((game) => (
    game.name.toLocaleLowerCase().includes(normalizedSearch)
  ));
  // -------------------------------------------------------------------------

  const showCount = !loading && !error && games.length > 0;

  return (
    <PageShell className="games-page">
      <motion.header
        className="page-head"
        variants={stagger(0.08, 0.1)}
        initial="hidden"
        animate="show"
      >
        <motion.p variants={fadeUp} className="eyebrow">THE CATALOGUE</motion.p>
        <motion.h1 variants={fadeUp}>PC Games <span className="accent">Mods</span></motion.h1>
        <motion.p variants={fadeUp} className="section-description">
          Pick a game to see its cheat table and DLL downloads.
        </motion.p>

        <motion.div variants={fadeUp} className="search-bar glass-card">
          <label htmlFor="gameSearch" className="sr-only">Search games</label>
          <SearchIcon className="search-icon" />
          <input
            id="gameSearch"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by game name..."
            autoComplete="off"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
              >
                <CloseIcon />
              </motion.button>
            )}
          </AnimatePresence>
          {showCount && (
            <span className="search-count" aria-live="polite">
              {normalizedSearch
                ? `${filteredGames.length} of ${games.length}`
                : `${games.length} games`}
            </span>
          )}
        </motion.div>
      </motion.header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <div className="game-rows" role="status" aria-label="Loading games">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="game-row skeleton-row" key={index}>
              <span className="skeleton row-media" />
              <span className="row-body">
                <span className="skeleton skeleton-line" style={{ width: '40%' }} />
                <span className="skeleton skeleton-pill" />
              </span>
            </div>
          ))}
        </div>
      ) : error ? null : games.length === 0 ? (
        <p className="empty-note" role="status">No games are available right now.</p>
      ) : filteredGames.length === 0 ? (
        <div className="empty-note" role="status">
          <p>No games found for &ldquo;{search.trim()}&rdquo;.</p>
          <button type="button" className="text-link" onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : (
        <motion.ul
          className="game-rows"
          variants={stagger(0.07, 0.25)}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, index) => (
              <motion.li
                key={game.slug}
                layout
                variants={rowVariants}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              >
                <Link
                  to={`/pcgames/${encodeURIComponent(game.slug)}`}
                  className="game-row glow-card"
                  aria-label={`View ${game.name} downloads`}
                >
                  <span className="row-media">
                    <img src={getGameImage(game.slug)} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="row-body">
                    <span className="row-text">
                      <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="row-title">{game.name}</span>
                      <span className="row-meta">Cheat Table (.CT) · DLL Files</span>
                    </span>
                    <span className="row-cta">
                      Explore <ArrowIcon />
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Link to="/" className="back-link">← Back to Home</Link>
    </PageShell>
  );
}
