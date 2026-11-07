import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

const GAME_IMAGES = {
  'gta-v': '/gta1.png',
  valorant: '/valo.png',
  minecraft: '/mine.png',
  'among-us': '/among.png',
  sekiro: '/SEKIRO.jpg',
  'god-of-war': '/god.webp',
  'lies-of-p': '/Lies of P.jpg',
  'assassins-creed-black-flag': "/Assassin's Creed IV.jpg",
  'spiderman-2': '/Marvel’s Spider-Man 2.jpg',
  'spiderman-remastered': '/spiderman remaster.png',
  'dying-light-2': '/Dying_Light_2.jpg',
  'assault-cube': '/AssaultCubee.jpg',
  'elden-ring': '/eldenring.jpg',
  'resident-evil-4-remake': '/re4.jpg',
};

export default function PCGamesPage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest('/games')
      .then((response) => setGames(response.games))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function openGame(event, slug) {
    event.preventDefault();
    const gameWindow = window.open('about:blank', '_blank');
    if (gameWindow) {
      gameWindow.opener = null;
    }

    try {
      const response = await apiRequest(`/games/${encodeURIComponent(slug)}/access`);
      if (gameWindow) {
        gameWindow.location = response.url;
      } else {
        window.location.assign(response.url);
      }
    } catch (requestError) {
      if (gameWindow) {
        gameWindow.close();
      }
      if (requestError.status === 401) {
        window.alert('Please log in to download files.');
        navigate('/');
        return;
      }
      setError(requestError.message);
    }
  }

  return (
    <div className="site-shell">
      <div className="games-page">
        <h1>PC GAMES MODs</h1>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? (
          <p className="login-note">Loading games...</p>
        ) : (
          <div className="game-grid">
            {games.map((game) => (
              <a
                key={game.slug}
                href="#"
                className="card-link"
                onClick={(event) => openGame(event, game.slug)}
              >
                <article className="card">
                  <img src={GAME_IMAGES[game.slug]} alt={game.name} />
                  <div className="card-content">
                    <h2>{game.title}</h2>
                  </div>
                </article>
              </a>
            ))}
          </div>
        )}

        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </div>
  );
}
