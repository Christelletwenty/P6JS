export type UserProfile = {
  id: string;

  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  profilePicture: string;

  height: number;
  weight: number;
  createdAt: string;

  weeklyGoal: number;

  runningSessions: RunningSession[];
};

export type RunningSession = {
  date: string;
  distanceKm: number;
  durationMin: number;
  caloriesBurned: number;

  heartRateMin: number;
  heartRateMax: number;
  heartRateAvg: number;
};
