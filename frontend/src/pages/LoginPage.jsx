import LoginForm from '../components/LoginForm';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  return (
    <div className="site-shell">
      <header className="welcome-banner">
        <h1>WELCOME TO MODS&apos;ZONE</h1>
        <p>Download Free Modded APKs of Popular Games and Apps</p>
      </header>

      <Navbar />

      <div className="login-wrapper">
        <LoginForm />
      </div>
    </div>
  );
}
