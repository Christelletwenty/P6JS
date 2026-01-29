import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RunningSession } from "~/types/profile";

type ActivityChartProps = {
  sessions: RunningSession[];
};

type ChartPoint = {
  day: string;
  distanceKm: number;
  durationMin: number;
  caloriesBurned: number;
};

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
}

function toChartData(sessions: RunningSession[]): ChartPoint[] {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({
      day: formatDayLabel(s.date),
      distanceKm: Number(s.distanceKm.toFixed(1)),
      durationMin: s.durationMin,
      caloriesBurned: s.caloriesBurned,
    }));
}

export default function ActivityChart({ sessions }: ActivityChartProps) {
  const data = toChartData(sessions);

  if (data.length === 0) {
    return (
      <div className="profile-card">
        <h2 className="profile-section-title">Activité (7 jours)</h2>
        <p>Aucune session sur la période.</p>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2 className="profile-section-title">Activité (7 jours)</h2>

      <div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={18}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "distanceKm") return [`${value} km`, "Distance"];
                if (name === "durationMin") return [`${value} min`, "Durée"];
                if (name === "caloriesBurned")
                  return [`${value} kcal`, "Calories"];
                return [String(value), String(name)];
              }}
            />
            <Bar dataKey="distanceKm" />
            <Bar dataKey="durationMin" />
            <Bar dataKey="caloriesBurned" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
