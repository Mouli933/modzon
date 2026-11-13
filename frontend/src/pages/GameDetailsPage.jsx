import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="download-icon">
      <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 17v4h14v-4" />
    </svg>
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

  return (
    <div className="site-shell">
      <Navbar />
      <main className="game-details-page">
        {location.state?.message && <p className="login-note" role="status">{location.state.message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? (
          <p className="login-note" role="status">Loading game...</p>
        ) : !game ? (
          <section className="game-details-card">
            <h1>Game not found</h1>
            <p className="login-note">This game is not in the available catalogue.</p>
            <Link to="/pcgames" className="back-link">← Back to PC Games</Link>
          </section>
        ) : (
          <section className="game-details-card" aria-labelledby="game-details-title">
            <img className="game-details-image" src={getGameImage(game.slug)} alt="" />
            <h1 id="game-details-title">{game.name}</h1>
            <section className="game-cheats" aria-labelledby="available-cheats-title">
              <h2 id="available-cheats-title">Available Cheats</h2>
              <p className="download-note">
                No verified cheat details have been provided for this game yet.
              </p>
            </section>
            <h2>Available Downloads</h2>
            <div className="game-download-options">
              <div className="game-download-option">
                <div>
                  <h3>Cheat Table (.CT)</h3>
                  <p className="download-note">Login required to download this game&apos;s cheat table.</p>
                </div>
                <button
                  type="button"
                  className="download-button"
                  onClick={downloadCheatTable}
                  disabled={isDownloadingCheatTable}
                >
                  <DownloadIcon />
                  {isDownloadingCheatTable ? 'Downloading...' : 'Download Cheat Table'}
                </button>
              </div>

              <div className="game-download-option">
                <div>
                  <h3>DLL Files</h3>
                  <p className="download-note">Login required to access the protected game folder.</p>
                </div>
                <button
                  type="button"
                  className="download-button"
                  onClick={openDllFolder}
                  disabled={isOpening}
                >
                  <DownloadIcon />
                  {isOpening ? 'Opening...' : 'Download DLL Files'}
                </button>
              </div>
            </div>
            {downloadError && <p className="form-error" role="alert">{downloadError}</p>}
            <Link to="/pcgames" className="back-link">← Back to PC Games</Link>
          </section>
        )}
      </main>
    </div>
  );
}
