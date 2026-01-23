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
          <li>Dashboard</li>
          <li>Mon profil</li>
          <li className="topbar-sep">|</li>
          <li>
            <button className="logout-btn">Se déconnecter</button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Menu;
