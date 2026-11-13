import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAvailableGames } from '../services/games';

export default function Navbar() {
  const [games, setGames] = useState([]);
  const [gamesError, setGamesError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  function handleSummaryClick(event) {
    event.preventDefault();
    if (window.matchMedia('(hover: none)').matches || event.detail === 0) {
      setDropdownOpen((open) => !open);
    } else {
      setDropdownOpen(true);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-items">
        <Link to="/">Home</Link>
        <details
          className="games-dropdown"
          open={dropdownOpen}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') {
              setDropdownOpen(true);
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') {
              setDropdownOpen(false);
            }
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setDropdownOpen(false);
            }
          }}
        >
          <summary onClick={handleSummaryClick}>PC Games</summary>
          <div className="games-dropdown-menu">
            <Link to="/pcgames" onClick={() => setDropdownOpen(false)}>All PC Games</Link>
            {gamesError ? (
              <span className="games-dropdown-message">{gamesError}</span>
            ) : (
              games.map((game) => (
                <Link
                  key={game.slug}
                  to={`/pcgames/${encodeURIComponent(game.slug)}`}
                  onClick={() => setDropdownOpen(false)}
                >
                  {game.name}
                </Link>
              ))
            )}
          </div>
        </details>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}
