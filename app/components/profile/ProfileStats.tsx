import type { RunningSession } from "../../types/profile";

type ProfileStatsProps = {
  sessions: RunningSession[];
};

function toDateOnly(dateStr: string): Date {
  // "2025-01-04" -> Date à minuit (évite des bugs d’heure)
  return new Date(`${dateStr}T00:00:00`);
}

/* function daysBetweenInclusive(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
  return diffDays + 1; // inclusif: start et end comptent
} */

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
    <section>
      <h2>Vos statistiques{startDate ? ` depuis le ${startDate}` : ""}</h2>

      <p>Nombre de sessions : {sessions.length}</p>
      <p>Temps total couru : {totalDuration} min</p>
      <p>Distance totale parcourue : {totalDistance.toFixed(1)} km</p>
      <p>Calories brûlées : {totalCalories} kcal</p>
      <p>Nombre de jours de repos : {restDays}</p>
    </section>
  );
}

export default ProfileStats;
