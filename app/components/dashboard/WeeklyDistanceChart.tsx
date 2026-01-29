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
import { useMemo, useState } from "react";
import type { RunningSession } from "~/types/profile";
import { useAuth } from "~/contexts/AuthContext";
import { useUserActivity } from "~/hooks/useUserActivity";

type Point = { week: string; km: number };

function startOfWeekMondayUTC(d: Date): Date {
  const x = new Date(d);
  const day = (x.getUTCDay() + 6) % 7; // lun=0
  x.setUTCDate(x.getUTCDate() - day);
  x.setUTCHours(12, 0, 0, 0);
  return x;
}

function addWeeksUTC(d: Date, weeks: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + weeks * 7);
  return x;
}

function addDaysUTC(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function parseSessionDate(dateStr: string): Date {
  const key = dateStr.slice(0, 10);
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function buildWeeklyDistance4Weeks(
  sessions: RunningSession[],
  windowStart: Date, // lundi S-3
): Point[] {
  // 4 semaines: S1..S4, où S4 = semaine de fin de la fenêtre
  const weeks = [0, 1, 2, 3].map((i) => addWeeksUTC(windowStart, i));

  const totals = new Map<number, number>();
  for (const w of weeks) totals.set(w.getTime(), 0);

  for (const s of sessions) {
    const sd = parseSessionDate(s.date);
    const sw = startOfWeekMondayUTC(sd).getTime();
    if (totals.has(sw)) totals.set(sw, (totals.get(sw) ?? 0) + s.distanceKm);
  }

  return weeks.map((w, idx) => {
    const km = totals.get(w.getTime()) ?? 0;
    return { week: `S${idx + 1}`, km: Number(km.toFixed(1)) };
  });
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

export default function WeeklyDistanceChart() {
  const { token } = useAuth();

  // 0 = fenêtre qui se termine cette semaine (S4 = cette semaine)
  const [weekEndOffset, setWeekEndOffset] = useState(0);

  const todayWeekStart = useMemo(() => startOfWeekMondayUTC(new Date()), []);

  // lundi de la semaine de fin (dépend de weekEndOffset)
  const endWeekStart = useMemo(
    () => addWeeksUTC(todayWeekStart, weekEndOffset),
    [todayWeekStart, weekEndOffset],
  );

  // fenêtre = 4 semaines glissantes : [lundi S-3, lundi S+1)
  const windowStart = useMemo(
    () => addWeeksUTC(endWeekStart, -3),
    [endWeekStart],
  );
  const windowEndExclusive = useMemo(
    () => addWeeksUTC(endWeekStart, 1),
    [endWeekStart],
  );

  // fetch exactement la fenêtre 4 semaines
  const { sessions, loading, error } = useUserActivity(
    token,
    windowStart,
    windowEndExclusive,
  );

  const data = useMemo(
    () => buildWeeklyDistance4Weeks(sessions, windowStart),
    [sessions, windowStart],
  );

  const avg =
    data.length > 0
      ? Number((data.reduce((a, b) => a + b.km, 0) / data.length).toFixed(1))
      : 0;

  // navigation (pas de futur)
  const canNext = endWeekStart.getTime() < todayWeekStart.getTime();
  const canPrev = true;

  const rangeLabel = useMemo(
    () => formatRangeFr(windowStart, windowEndExclusive),
    [windowStart, windowEndExclusive],
  );

  return (
    <div className="card">
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <div className="card-big">{avg}km en moyenne</div>
          <div className="card-sub">
            Total des kilomètres (fenêtre 4 semaines)
          </div>
          {loading && (
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
              Chargement…
            </div>
          )}
          {error && (
            <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 4 }}>
              {error}
            </div>
          )}
        </div>

        {/* Navigation + label AU MILIEU */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            aria-label="Fenêtre précédente"
            onClick={() => canPrev && setWeekEndOffset((x) => x - 1)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          <div style={{ color: "#111827", fontSize: 14, whiteSpace: "nowrap" }}>
            {rangeLabel}
          </div>

          <button
            type="button"
            aria-label="Fenêtre suivante"
            onClick={() => canNext && setWeekEndOffset((x) => x + 1)}
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
              domain={[0, "dataMax + 5"]}
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
