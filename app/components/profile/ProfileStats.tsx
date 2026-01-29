import type { RunningSession } from "../../types/profile";

type ProfileStatsProps = {
  sessions: RunningSession[];
};

function toDateOnly(dateStr: string): Date {
  // "2025-01-04" -> Date à minuit (évite des bugs d’heure)
  return new Date(`${dateStr}T00:00:00`);
}

function ProfileStats({ sessions }: ProfileStatsProps) {
  // state

  // comportements
  const totalDuration = sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const totalDistance = sessions.reduce((acc, s) => acc + s.distanceKm, 0);
  const totalCalories = sessions.reduce((acc, s) => acc + s.caloriesBurned, 0);
  const uniqueDates = new Set(sessions.map((s) => s.date));
  const sortedDates = [...uniqueDates].sort();

  const startDate =
    sessions.length === 0
      ? null
      : sessions.reduce(
          (min, s) => (s.date < min ? s.date : min),
          sessions[0].date,
        );

  const today = new Date();
  const start7Days = new Date(today);
  start7Days.setDate(today.getDate() - 6); // inclusif => 7 jours

  const runsInLast7Days = sessions.filter((s) => {
    const d = toDateOnly(s.date);
    return d >= toDateOnly(start7Days.toISOString().slice(0, 10)) && d <= today;
  });

  const daysWithRunLast7 = new Set(runsInLast7Days.map((s) => s.date)).size;

  const restDays = 7 - daysWithRunLast7;

  // render
  return (
    <section className="stats">
      <header className="stats-header">
        <h2 className="stats-title">Vos statistiques</h2>
        <p className="stats-subtitle">
          {startDate ? `depuis le ${startDate}` : ""}
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Temps total couru</p>
          <p className="stat-value">{totalDuration} min</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Calories brûlées</p>
          <p className="stat-value">{totalCalories} kcal</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Distance totale parcourue</p>
          <p className="stat-value">{totalDistance.toFixed(1)} km</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Nombre de jours de repos</p>
          <p className="stat-value">{restDays} jours</p>
        </div>

        <div className="stat-card stat-card--wide">
          <p className="stat-label">Nombre de sessions</p>
          <p className="stat-value">{sessions.length} sessions</p>
        </div>
      </div>
    </section>
  );
}

export default ProfileStats;
