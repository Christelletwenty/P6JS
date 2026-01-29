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
import type { RunningSession } from "~/types/profile";
import { useEffect, useMemo, useState } from "react";

type Props = { sessions: RunningSession[] };

type Point = {
  day: (typeof DAYS)[number];
  minBpm: number;
  maxBpm: number;
  avgBpm: number;
  totalMin: number;
};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function parseSessionDate(dateStr: string): Date {
  // On ne garde que YYYY-MM-DD (ça ignore "T...Z" et évite les décalages)
  const key = dateStr.slice(0, 10);
  const [y, m, d] = key.split("-").map(Number);
  // Date en UTC à midi (évite les soucis DST)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function dayIndex(dateStr: string): number {
  const d = parseSessionDate(dateStr);
  const js = d.getUTCDay(); // dim=0
  return (js + 6) % 7; // lun=0
}

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  // on travaille en UTC
  const day = (x.getUTCDay() + 6) % 7; // lun=0
  x.setUTCDate(x.getUTCDate() - day);
  x.setUTCHours(12, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function addWeeks(d: Date, weeks: number): Date {
  return addDays(d, weeks * 7);
}

function ymd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatRangeFr(start: Date, endExclusive: Date): string {
  // endExclusive = lundi+7 => on affiche le jour précédent
  const end = addDays(endExclusive, -1);

  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  });
  const a = fmt.format(start).replace(".", "");
  const b = fmt.format(end).replace(".", "");
  return `${a} - ${b}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
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

    // min/max du jour
    p.minBpm =
      p.totalMin === 0 ? s.heartRateMin : Math.min(p.minBpm, s.heartRateMin);
    p.maxBpm =
      p.totalMin === 0 ? s.heartRateMax : Math.max(p.maxBpm, s.heartRateMax);

    // avg pondérée par la durée (plus réaliste si plusieurs sessions)
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

export default function HeartRateWeeklyChart({ sessions }: Props) {
  // bornes (min/max) : basées sur tes données + un buffer
  const { minWeekStart, maxWeekStart } = useMemo(() => {
    if (sessions.length === 0) {
      const now = startOfWeekMonday(new Date());
      return {
        minWeekStart: addWeeks(now, -12),
        maxWeekStart: addWeeks(now, 4),
      };
    }

    const ms = sessions.map((s) => parseSessionDate(s.date).getTime());

    const minDate = new Date(Math.min(...ms));
    const maxDate = new Date(Math.max(...ms));

    // buffer pour pouvoir naviguer avant/après tes données
    const min = addWeeks(startOfWeekMonday(minDate), -8);
    const max = addWeeks(startOfWeekMonday(maxDate), 4);

    return {
      minWeekStart: min,
      maxWeekStart: max,
    };
  }, [sessions]);

  // semaine “courante” = dernière semaine où tu as une session
  const initialWeekStart = useMemo(() => {
    if (sessions.length === 0) return startOfWeekMonday(new Date());
    const last = sessions
      .map((s) => parseSessionDate(s.date))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    return startOfWeekMonday(last);
  }, [sessions]);

  // offset entre minWeekStart et la semaine affichée
  const initialOffset = useMemo(() => {
    const diffMs = initialWeekStart.getTime() - minWeekStart.getTime();
    return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  }, [initialWeekStart, minWeekStart]);

  const maxOffset = useMemo(() => {
    const diffMs = maxWeekStart.getTime() - minWeekStart.getTime();
    return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  }, [maxWeekStart, minWeekStart]);

  const [weekOffset, setWeekOffset] = useState<number>(
    clamp(initialOffset, 0, maxOffset),
  );

  useEffect(() => {
    // Quand les sessions arrivent (ou changent), on recale sur la dernière semaine dispo
    if (sessions.length === 0) return;

    const last = sessions
      .map((s) => parseSessionDate(s.date))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const targetWeekStart = startOfWeekMonday(last);
    const diffMs = targetWeekStart.getTime() - minWeekStart.getTime();
    const targetOffset = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

    setWeekOffset(clamp(targetOffset, 0, maxOffset));
  }, [sessions, minWeekStart, maxOffset]);

  const weekStart = useMemo(
    () => addWeeks(minWeekStart, weekOffset),
    [minWeekStart, weekOffset],
  );
  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const weekSessions = useMemo(() => {
    const startMs = weekStart.getTime();
    const endMs = weekEndExclusive.getTime();

    return sessions.filter((s) => {
      const ms = parseSessionDate(s.date).getTime();
      return ms >= startMs && ms < endMs;
    });
  }, [sessions, weekStart, weekEndExclusive]);

  const data = useMemo(
    () => toWeeklyHeartRatePoints(weekSessions),
    [weekSessions],
  );

  const weekAvgBpm = useMemo(() => {
    // moyenne pondérée sur la semaine (en minutes) à partir des points journaliers
    const total = data.reduce((acc, p) => acc + p.totalMin, 0);
    if (total <= 0) return 0;
    const weighted = data.reduce((acc, p) => acc + p.avgBpm * p.totalMin, 0);
    return Math.round(weighted / total);
  }, [data]);

  const rangeLabel = useMemo(
    () => formatRangeFr(weekStart, weekEndExclusive),
    [weekStart, weekEndExclusive],
  );

  const canPrev = weekOffset > 0;
  const canNext = weekOffset < maxOffset;

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
        </div>

        {/* Navigation semaine (comme la maquette) */}
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
              // Optionnel : bornes “logiques” si tu veux un rendu stable
              // domain={[100, 200]}
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

            {/* Min (petite barre) */}
            <Bar
              dataKey="minBpm"
              name="minBpm"
              fill="#FCC1B6"
              stroke="#FCC1B6"
              radius={[999, 999, 999, 999]}
              barSize={18}
            />

            {/* Max (grande barre) */}
            <Bar
              dataKey="maxBpm"
              name="maxBpm"
              fill="#F4320B"
              stroke="#F4320B"
              radius={[999, 999, 999, 999]}
              barSize={18}
            />

            {/* Moyenne (ligne + points) */}
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
