import type { ApiUser } from "../types/api";
import type { UserProfile, RunningSession } from "../types/profile";

export function mapApiUserToUserProfile(apiUser: ApiUser): UserProfile {
  return {
    id: apiUser.id,

    firstName: apiUser.userInfos.firstName,
    lastName: apiUser.userInfos.lastName,
    age: apiUser.userInfos.age,
    gender: apiUser.userInfos.gender,
    profilePicture: apiUser.userInfos.profilePicture,

    height: apiUser.userInfos.height,
    weight: apiUser.userInfos.weight,
    createdAt: apiUser.userInfos.createdAt,

    weeklyGoal: apiUser.weeklyGoal,

    runningSessions: apiUser.runningData.map(
      (entry): RunningSession => ({
        date: entry.date,
        distanceKm: entry.distance,
        durationMin: entry.duration,
        caloriesBurned: entry.caloriesBurned,

        heartRateMin: entry.heartRate.min,
        heartRateMax: entry.heartRate.max,
        heartRateAvg: entry.heartRate.average,
      }),
    ),
  };
}
