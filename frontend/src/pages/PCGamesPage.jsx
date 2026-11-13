import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getGameImage } from '../services/gameAssets';
import { getAvailableGames } from '../services/games';

export default function PCGamesPage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="site-shell">
      <Navbar />
      <main className="games-page">
        <h1>PC GAMES MODs</h1>
        <div className="games-search">
          <label htmlFor="gameSearch">Search games</label>
          <input
            id="gameSearch"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by game name..."
          />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? (
          <p className="login-note" role="status">Loading games...</p>
        ) : error ? null : games.length === 0 ? (
          <p className="login-note" role="status">No games are available right now.</p>
        ) : filteredGames.length === 0 ? (
          <p className="login-note" role="status">No games found.</p>
        ) : (
          <div className="game-grid">
            {filteredGames.map((game) => (
              <Link
                key={game.slug}
                to={`/pcgames/${encodeURIComponent(game.slug)}`}
                className="game-card"
                aria-label={`View ${game.name} downloads`}
              >
                <img src={getGameImage(game.slug)} alt="" />
                <span>{game.name}</span>
              </Link>
            ))}
          </div>
        )}

        <Link to="/" className="back-link">← Back to Home</Link>
      </main>
    </div>
  );
}
