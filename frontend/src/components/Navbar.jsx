import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/pcgames">PC Games</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}
