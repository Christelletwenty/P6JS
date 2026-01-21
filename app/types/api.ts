export type ApiHeartRate = {
  min: number;
  max: number;
  average: number;
};

export type ApiRunningEntry = {
  date: string;
  distance: number;
  duration: number;
  heartRate: ApiHeartRate;
  caloriesBurned: number;
};

export type ApiUserInfos = {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  profilePicture: string;
  height: number;
  weight: number;
  createdAt: string;
};

export type ApiUser = {
  id: string;
  weeklyGoal: number;
  userInfos: ApiUserInfos;

  username: string;
  password: string;
  runningData: ApiRunningEntry[];
};
