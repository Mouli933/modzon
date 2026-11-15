import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DownloadIcon,
  FolderIcon,
  LockIcon,
  TableFileIcon,
  UnlockIcon,
} from '../components/icons';
import { EASE, fadeUp, stagger } from '../components/motionPresets';
import PageShell from '../components/PageShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';

function DownloadCard({ step, Icon, title, description, buttonLabel, busyLabel, busy, unlocked, onClick }) {
  return (
    <motion.article
      className="download-card glow-card"
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="download-card-top">
        <span className="icon-tile"><Icon /></span>
        <span className="download-step">{step}</span>
      </div>
      <h3>{title}</h3>
      <p className="download-note">{description}</p>
      <span className={`status-pill${unlocked ? ' is-unlocked' : ''}`}>
        {unlocked ? <UnlockIcon /> : <LockIcon />}
        {unlocked ? 'Signed in' : 'Login required'}
      </span>
      <button
        type="button"
        className="download-button"
        onClick={onClick}
        disabled={busy}
        aria-busy={busy}
      >
        <DownloadIcon className="download-icon" />
        {busy ? busyLabel : buttonLabel}
      </button>
    </motion.article>
  );
}

export default function GameDetailsPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, clearUser } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [isDownloadingCheatTable, setIsDownloadingCheatTable] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // --- Existing data + download logic (unchanged) --------------------------
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

  const game = games.find((availableGame) => availableGame.slug === slug);

  async function downloadCheatTable() {
    setDownloadError('');
    if (!isAuthenticated) {
      const message = 'Please log in to download the Cheat Table.';
      setDownloadError(message);
      navigate('/login', {
        state: { gameSlug: slug, downloadType: 'cheat-table', message },
      });
      return;
    }

    setIsDownloadingCheatTable(true);
    try {
      const response = await apiRequest(`/games/${encodeURIComponent(slug)}/cheat-table`);
      const downloadUrl = new URL(response.url);
      if (downloadUrl.protocol !== 'https:' || downloadUrl.hostname !== 'www.mediafire.com') {
        throw new Error('The cheat-table URL returned by the server is invalid.');
      }
      window.location.assign(downloadUrl.href);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearUser();
        const message = 'Please log in to download the Cheat Table.';
        setDownloadError(message);
        navigate('/login', {
          state: { gameSlug: slug, downloadType: 'cheat-table', message },
        });
      } else {
        setDownloadError(requestError.status === 404
          ? 'Cheat Table Currently Unavailable.'
          : requestError.message);
      }
    } finally {
      setIsDownloadingCheatTable(false);
    }
  }

  async function openDllFolder() {
    setDownloadError('');
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          gameSlug: slug,
          message: 'Please log in to access this game’s DLL files.',
        },
      });
      return;
    }

    const downloadTab = window.open('about:blank', '_blank');
    if (!downloadTab) {
      setDownloadError('Allow pop-ups to open the protected game folder in a new tab.');
      return;
    }
    downloadTab.opener = null;
    setIsOpening(true);

    try {
      const response = await apiRequest(`/games/${encodeURIComponent(slug)}/access`);
      const gameUrl = new URL(response.url);
      if (gameUrl.protocol !== 'https:' || gameUrl.hostname !== 'github.com') {
        throw new Error('The game repository URL returned by the server is invalid.');
      }
      downloadTab.location.replace(gameUrl.href);
    } catch (requestError) {
      downloadTab.close();
      if (requestError.status === 401) {
        clearUser();
        navigate('/login', {
          state: {
            gameSlug: slug,
            message: 'Your session expired. Please log in to access this game’s DLL files.',
          },
        });
      } else {
        setDownloadError(requestError.message);
      }
    } finally {
      setIsOpening(false);
    }
  }
  // -------------------------------------------------------------------------

  return (
    <PageShell className="game-details-page">
      {location.state?.message && (
        <p className="notice" role="status">{location.state.message}</p>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}

      {loading ? (
        <div className="details-hero" role="status" aria-label="Loading game">
          <span className="skeleton details-art" />
          <div className="details-info">
            <span className="skeleton skeleton-line" style={{ width: '30%' }} />
            <span className="skeleton skeleton-line" style={{ width: '70%', height: 44 }} />
            <span className="skeleton skeleton-line" style={{ width: '90%' }} />
          </div>
        </div>
      ) : !game ? (
        <section className="glass-card not-found">
          <h1>Game not found</h1>
          <p className="empty-note">This game is not in the available catalogue.</p>
          <Link to="/pcgames" className="text-link">← Back to PC Games</Link>
        </section>
      ) : (
        <>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/pcgames">PC Games</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{game.name}</span>
          </nav>

          <section className="details-hero" aria-labelledby="game-details-title">
            <div className="details-backdrop" aria-hidden="true">
              <img src={getGameImage(game.slug)} alt="" />
            </div>

            <motion.div
              className="details-art glow-card"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <img src={getGameImage(game.slug)} alt={`${game.name} artwork`} />
            </motion.div>

            <motion.div
              className="details-info"
              variants={stagger(0.09, 0.2)}
              initial="hidden"
              animate="show"
            >
              <motion.p variants={fadeUp} className="eyebrow">
                <span className="pulse-dot" /> GAME RESOURCES
              </motion.p>
              <motion.h1 variants={fadeUp} id="game-details-title">{game.name}</motion.h1>

              <motion.section variants={fadeUp} className="game-cheats" aria-labelledby="available-cheats-title">
                <h2 id="available-cheats-title">Available Cheats</h2>
                <p className="download-note">
                  No verified cheat details have been provided for this game yet.
                </p>
              </motion.section>

              <motion.span
                variants={fadeUp}
                className={`status-pill${isAuthenticated ? ' is-unlocked' : ''}`}
              >
                {isAuthenticated ? <UnlockIcon /> : <LockIcon />}
                {isAuthenticated ? 'Signed in — downloads unlocked' : 'Log in to unlock downloads'}
              </motion.span>
            </motion.div>
          </section>

          <section className="downloads" aria-labelledby="downloads-title">
            <h2 id="downloads-title" className="downloads-title">Available Downloads</h2>
            <motion.div
              className="download-grid"
              variants={stagger(0.12, 0.35)}
              initial="hidden"
              animate="show"
            >
              <DownloadCard
                step="01"
                Icon={TableFileIcon}
                title="Cheat Table (.CT)"
                description="Login required to download this game's cheat table."
                buttonLabel="Download Cheat Table"
                busyLabel="Downloading..."
                busy={isDownloadingCheatTable}
                unlocked={isAuthenticated}
                onClick={downloadCheatTable}
              />
              <DownloadCard
                step="02"
                Icon={FolderIcon}
                title="DLL Files"
                description="Login required to access the protected game folder."
                buttonLabel="Download DLL Files"
                busyLabel="Opening..."
                busy={isOpening}
                unlocked={isAuthenticated}
                onClick={openDllFolder}
              />
            </motion.div>

            <AnimatePresence>
              {downloadError && (
                <motion.p
                  className="form-error banner"
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {downloadError}
                </motion.p>
              )}
            </AnimatePresence>
          </section>

          <Link to="/pcgames" className="back-link">← Back to PC Games</Link>
        </>
      )}
    </PageShell>
  );
}
