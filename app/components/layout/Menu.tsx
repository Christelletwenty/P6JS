import { useNavigate, Link } from "react-router";
import { useAuth } from "~/contexts/AuthContext";

function Menu() {
  // state
  const navigate = useNavigate();
  const { clearAuth, isAuthenticated } = useAuth();

  // comportements
  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // render
  return (
    <header className="topbar">
      <img className="topbar-logo" src="/Logo.svg" alt="SportSee" />

      <nav className="topbar-nav">
        <ul className="topbar-links">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Mon profil</Link>
          </li>
          <li className="topbar-sep">|</li>
          <li>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="logout-btn"
              >
                Se déconnecter
              </button>
            ) : (
              <Link to="/login">Se connecter</Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Menu;
