import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="nf-page">
      <div className="nf-card">
        <div className="nf-badge">404</div>
        <h1 className="nf-title">Page introuvable</h1>
        <p className="nf-text">
          La page que vous cherchez n’existe pas (ou a été déplacée).
        </p>

        <div className="nf-actions">
          <Link className="nf-btn nf-btn-primary" to="/dashboard">
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
