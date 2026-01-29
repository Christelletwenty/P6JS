import { useEffect, useMemo, useState } from "react";
import { fetchUserActivity, type UserActivityParams } from "~/services/user";
import { mapApiRunningEntriesToRunningSessions } from "../mappers/activityMapper";
import type { RunningSession } from "~/types/profile";

type UseUserActivityResult = {
  loading: boolean;
  error: string | null;
  sessions: RunningSession[];
  params: UserActivityParams;
};

function toIsoDateUTC(d: Date): string {
  // on s’assure que c’est bien YYYY-MM-DD en UTC
  return d.toISOString().slice(0, 10);
}

function addDaysUTC(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export function useUserActivity(
  token: string | null,
  startDate?: Date,
  endDateExclusive?: Date, // plus safe que end inclusif
): UseUserActivityResult {
  // params change dès que start/end change -> refetch automatique
  const params = useMemo<UserActivityParams>(() => {
    // fallback: dernière semaine glissante si rien n’est fourni
    const endEx = endDateExclusive ?? addDaysUTC(new Date(), 1); // demain (exclusif)
    const start = startDate ?? addDaysUTC(endEx, -7);

    // on convertit endExclusive -> endInclusif
    const endInclusive = addDaysUTC(endEx, -1);

    return {
      startWeek: toIsoDateUTC(start),
      endWeek: toIsoDateUTC(endInclusive),
    };
  }, [startDate, endDateExclusive]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<RunningSession[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchUserActivity(token, params)
      .then((entries) => {
        if (cancelled) return;
        setSessions(mapApiRunningEntriesToRunningSessions(entries));
      })
      .catch((e) => {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Failed to load activity";
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, params]);

  return { loading, error, sessions, params };
}
