import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ContactPage from './pages/ContactPage';
import GameDetailsPage from './pages/GameDetailsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PCGamesPage from './pages/PCGamesPage';
import SignupPage from './pages/SignupPage';

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="site-shell auth-loading" role="status">
        Checking your session...
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/pcgames/:slug" element={<GameDetailsPage />} />
      <Route path="/pcgames" element={<PCGamesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
