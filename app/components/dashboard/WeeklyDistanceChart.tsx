import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { RunningSession } from "~/types/profile";

type Props = { sessions: RunningSession[] };

type Point = { week: string; km: number };

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lundi=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function buildWeekly(sessions: RunningSession[]): Point[] {
  // range = 4 semaines glissantes depuis la semaine courante
  const now = new Date();
  const w0 = startOfWeek(now);
  const weeks = [3, 2, 1, 0].map((n) => {
    const d = new Date(w0);
    d.setDate(d.getDate() - n * 7);
    return d;
  });

  const totals = new Map<string, number>();
  for (const w of weeks) totals.set(toISODate(w), 0);

  for (const s of sessions) {
    const sd = new Date(`${s.date}T00:00:00`);
    const sw = toISODate(startOfWeek(sd));
    if (totals.has(sw)) totals.set(sw, (totals.get(sw) ?? 0) + s.distanceKm);
  }

  return weeks.map((w, idx) => ({
    week: `S${idx + 1}`,
    km: Number((totals.get(toISODate(w)) ?? 0).toFixed(1)),
  }));
}

export default function WeeklyDistanceChart({ sessions }: Props) {
  const data = buildWeekly(sessions);
  const avg =
    data.length > 0
      ? Number((data.reduce((a, b) => a + b.km, 0) / data.length).toFixed(1))
      : 0;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-big">{avg}km en moyenne</div>
          <div className="card-sub">
            Total des kilomètres 4 dernières semaines
          </div>
        </div>
      </div>

      <div
        style={{ height: 260, minHeight: 260, width: "100%", marginTop: 12 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap={36}
            margin={{ top: 12, right: 10, left: 10, bottom: 26 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E9ECF5"
              strokeDasharray="3 6"
            />

            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={{ stroke: "#6B7280", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#6B7280", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              width={34}
              domain={[0, 32]}
              ticks={[0, 10, 20, 30]}
            />

            <Tooltip
              cursor={{ fill: "rgba(182, 189, 252, 0.14)" }}
              formatter={(v) => [`${v} km`, "Distance"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #EEF0F6",
                boxShadow: "0 10px 24px rgba(16, 24, 40, 0.10)",
                padding: "10px 12px",
              }}
              labelStyle={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}
              itemStyle={{ color: "#111827", fontSize: 13 }}
            />

            <Legend
              verticalAlign="bottom"
              align="left"
              iconType="circle"
              formatter={() => "Km"}
              wrapperStyle={{
                paddingLeft: 6,
                paddingTop: 10,
                fontSize: 12,
                color: "#6B7280",
              }}
            />

            <Bar
              dataKey="km"
              fill="#B6BDFC"
              stroke="#B6BDFC"
              fillOpacity={0.9}
              radius={[999, 999, 999, 999]}
              barSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
