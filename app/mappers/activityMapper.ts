import type { ApiRunningEntry } from "~/types/api";
import type { RunningSession } from "~/types/profile";

export function mapApiRunningEntriesToRunningSessions(
  entries: ApiRunningEntry[],
): RunningSession[] {
  return entries.map((e) => ({
    date: e.date,
    distanceKm: e.distance,
    durationMin: e.duration,
    caloriesBurned: e.caloriesBurned,
    heartRateMin: e.heartRate.min,
    heartRateMax: e.heartRate.max,
    heartRateAvg: e.heartRate.average,
  }));
}
