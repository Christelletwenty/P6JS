import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { useUserActivity } from "~/hooks/useUserActivity";
import { useAuth } from "~/contexts/AuthContext";
import type { RunningSession } from "~/types/profile";

type Point = {
  day: (typeof DAYS)[number];
  minBpm: number;
  maxBpm: number;
  avgBpm: number;
  totalMin: number;
};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

function startOfWeekMondayUTC(d: Date): Date {
  const x = new Date(d);
  const day = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - day);
  x.setUTCHours(12, 0, 0, 0);
  return x;
}
function addDaysUTC(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}
function addWeeksUTC(d: Date, weeks: number): Date {
  return addDaysUTC(d, weeks * 7);
}
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
function formatRangeFr(start: Date, endExclusive: Date): string {
  const end = addDaysUTC(endExclusive, -1);
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  });
  const a = fmt.format(start).replace(".", "");
  const b = fmt.format(end).replace(".", "");
  return `${a} - ${b}`;
}

function parseSessionDate(dateStr: string): Date {
  const key = dateStr.slice(0, 10);
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}
function dayIndex(dateStr: string): number {
  const d = parseSessionDate(dateStr);
  const js = d.getUTCDay(); // dim=0
  return (js + 6) % 7; // lun=0
}

function toWeeklyHeartRatePoints(weekSessions: RunningSession[]): Point[] {
  const base: Point[] = DAYS.map((day) => ({
    day,
    minBpm: 0,
    maxBpm: 0,
    avgBpm: 0,
    totalMin: 0,
  }));

  for (const s of weekSessions) {
    const i = dayIndex(s.date);
    const p = base[i];

    p.minBpm =
      p.totalMin === 0 ? s.heartRateMin : Math.min(p.minBpm, s.heartRateMin);
    p.maxBpm =
      p.totalMin === 0 ? s.heartRateMax : Math.max(p.maxBpm, s.heartRateMax);

    const w = Math.max(1, s.durationMin);
    const prevWeighted = p.avgBpm * p.totalMin;
    p.totalMin += w;
    p.avgBpm = (prevWeighted + s.heartRateAvg * w) / p.totalMin;
  }

  return base.map((p) => ({
    ...p,
    minBpm: p.totalMin === 0 ? 0 : Math.round(p.minBpm),
    maxBpm: p.totalMin === 0 ? 0 : Math.round(p.maxBpm),
    avgBpm: p.totalMin === 0 ? 0 : Math.round(p.avgBpm),
  }));
}

export default function HeartRateWeeklyChart() {
  const { token } = useAuth();

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const minWeekStart = useMemo(
    () => addWeeksUTC(startOfWeekMondayUTC(new Date()), -12),
    [],
  );

  // semaine affichée
  const [weekOffset, setWeekOffset] = useState(() => {
    const nowWeek = startOfWeekMondayUTC(new Date());
    const diffMs = nowWeek.getTime() - minWeekStart.getTime();
    return Math.round(diffMs / WEEK_MS); // démarre sur cette semaine
  });

  const weekStart = useMemo(
    () => addWeeksUTC(minWeekStart, weekOffset),
    [minWeekStart, weekOffset],
  );
  const weekEndExclusive = useMemo(() => addDaysUTC(weekStart, 7), [weekStart]);

  // semaine "aujourd’hui"
  const todayWeekStart = useMemo(() => startOfWeekMondayUTC(new Date()), []);

  const canPrev = weekOffset > 0;
  const canNext = weekStart.getTime() < todayWeekStart.getTime();

  // Fetch piloté par la semaine affichée
  const { sessions, loading, error } = useUserActivity(
    token,
    weekStart,
    weekEndExclusive,
  );

  const data = useMemo(() => toWeeklyHeartRatePoints(sessions), [sessions]);

  const weekAvgBpm = useMemo(() => {
    const total = data.reduce((acc, p) => acc + p.totalMin, 0);
    if (total <= 0) return 0;
    const weighted = data.reduce((acc, p) => acc + p.avgBpm * p.totalMin, 0);
    return Math.round(weighted / total);
  }, [data]);

  const rangeLabel = useMemo(
    () => formatRangeFr(weekStart, weekEndExclusive),
    [weekStart, weekEndExclusive],
  );

  return (
    <div className="card">
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <div className="card-big" style={{ color: "#F4320B" }}>
            {weekAvgBpm} BPM
          </div>
          <div className="card-sub">Fréquence cardiaque moyenne</div>
          {loading && (
            <div style={{ fontSize: 12, color: "#6B7280" }}>Chargement…</div>
          )}
          {error && (
            <div style={{ fontSize: 12, color: "#B91C1C" }}>{error}</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            aria-label="Semaine précédente"
            onClick={() => canPrev && setWeekOffset((x) => x - 1)}
            disabled={!canPrev}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "white",
              opacity: canPrev ? 1 : 0.4,
              cursor: canPrev ? "pointer" : "default",
            }}
          >
            ‹
          </button>

          <div style={{ color: "#111827", fontSize: 14, whiteSpace: "nowrap" }}>
            {rangeLabel}
          </div>

          <button
            type="button"
            aria-label="Semaine suivante"
            onClick={() => canNext && setWeekOffset((x) => x + 1)}
            disabled={!canNext}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "white",
              opacity: canNext ? 1 : 0.4,
              cursor: canNext ? "pointer" : "default",
            }}
          >
            ›
          </button>
        </div>
      </div>

      <div
        style={{ height: 260, minHeight: 260, width: "100%", marginTop: 12 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap={30}
            barGap={10}
            margin={{ top: 12, right: 10, left: 10, bottom: 26 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E9ECF5"
              strokeDasharray="3 6"
            />

            <XAxis
              dataKey="day"
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
            />

            <Tooltip
              cursor={{ fill: "rgba(244, 50, 11, 0.08)" }}
              formatter={(v, name) => {
                if (name === "minBpm") return [`${v} BPM`, "Min"];
                if (name === "maxBpm") return [`${v} BPM`, "Max"];
                if (name === "avgBpm") return [`${v} BPM`, "Moyenne"];
                return [String(v), String(name)];
              }}
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
              formatter={(value) => {
                if (value === "minBpm") return "Min";
                if (value === "maxBpm") return "Max BPM";
                if (value === "avgBpm") return "Moyenne";
                return value;
              }}
              wrapperStyle={{
                paddingLeft: 6,
                paddingTop: 10,
                fontSize: 12,
                color: "#6B7280",
              }}
            />

            <Bar
              dataKey="minBpm"
              name="minBpm"
              fill="#FCC1B6"
              stroke="#FCC1B6"
              radius={[999, 999, 999, 999]}
              barSize={18}
            />
            <Bar
              dataKey="maxBpm"
              name="maxBpm"
              fill="#F4320B"
              stroke="#F4320B"
              radius={[999, 999, 999, 999]}
              barSize={18}
            />
            <Line
              type="monotone"
              dataKey="avgBpm"
              name="avgBpm"
              stroke="#1D4ED8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
