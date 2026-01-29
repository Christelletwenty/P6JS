import { useAuth } from "~/contexts/AuthContext";
import { useUserInfo } from "~/hooks/useUserInfo";
import { useHydrated } from "~/hooks/useHydrated";
import { useUserActivity } from "~/hooks/useUserActivity";

import Menu from "~/components/layout/Menu";
import Footer from "~/components/layout/Footer";
import WeeklyDistanceChart from "~/components/dashboard/WeeklyDistanceChart";
import WeeklyActivityChart from "~/components/dashboard/WeeklyActivityChart";
import WeeklyGoalDonut from "~/components/dashboard/WeeklyGoalDonut";

function sumKm(s: { distanceKm: number }[]) {
  return Number(s.reduce((a, b) => a + b.distanceKm, 0).toFixed(1));
}
function sumMin(s: { durationMin: number }[]) {
  return Math.round(s.reduce((a, b) => a + b.durationMin, 0));
}

export default function DashboardPage() {
  const hydrated = useHydrated();
  const { token, isAuthenticated, clearAuth } = useAuth();
  const { data: userInfo } = useUserInfo(token);
  const profile = userInfo?.profile;
  const stats = userInfo?.statistics;

  // Hook actuel charge déjà 7 jours. OK pour "Cette semaine".
  const { loading, error, sessions, params } = useUserActivity(token);

  return (
    <main className="dashboard-page">
      <Menu />

      <div className="container">
        {/* Header user (comme maquette) */}
        <div className="hero">
          <div className="hero-left">
            {profile?.profilePicture ? (
              <img
                className="avatar"
                src={profile.profilePicture}
                alt="Profil"
              />
            ) : (
              <div className="avatar" />
            )}
            <div>
              <div className="hero-name">
                {profile ? `${profile.firstName} ${profile.lastName}` : "…"}
              </div>
              <div className="hero-sub">
                {profile?.createdAt
                  ? `Membre depuis le ${new Date(profile.createdAt).toLocaleDateString("fr-FR")}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-metric-label">Distance totale parcourue</div>
            <div className="hero-metric-box">
              {stats ? `${stats.totalDistance} km` : "…"}
            </div>
          </div>
        </div>

        <h2 className="section-title">Vos dernières performances</h2>

        {/* Ici on évite Recharts en SSR */}
        {!hydrated ? (
          <div className="grid2">
            <div className="card">Chargement…</div>
            <div className="card">Chargement…</div>
          </div>
        ) : (
          <div className="grid2">
            <WeeklyDistanceChart />
            <WeeklyActivityChart />
          </div>
        )}

        <h2 className="section-title" style={{ marginTop: 28 }}>
          Cette semaine
        </h2>
        <div className="section-sub">
          Du {params.startWeek} au {params.endWeek}
        </div>

        <div className="grid-week">
          <div>
            {!hydrated ? (
              <div className="card">Chargement…</div>
            ) : (
              <WeeklyGoalDonut done={sessions.length} goal={6} />
            )}
          </div>

          <div className="stack">
            <div className="card metric">
              <div className="metric-title-one">Durée d’activité</div>
              <div className="metric-value-one">
                {loading ? "…" : `${sumMin(sessions)} `}
                <span className="muted-one">minutes</span>
              </div>
            </div>

            <div className="card metric">
              <div className="metric-title-two">Distance</div>
              <div className="metric-value-two">
                {loading ? "…" : `${sumKm(sessions)} `}
                <span className="muted-two">kilomètres</span>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="card">{error}</div> : null}
      </div>
      <Footer />
    </main>
  );
}
