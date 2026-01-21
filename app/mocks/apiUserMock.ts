import type { ApiUser } from "../types/api";

export const apiUserMock: ApiUser = {
  id: "user123",
  weeklyGoal: 2,
  username: "sophiemartin",
  password: "password123",

  userInfos: {
    firstName: "Sophie",
    lastName: "Martin",
    age: 32,
    gender: "female",
    profilePicture: "http://localhost:8000/images/sophie.jpg",
    height: 165,
    weight: 60,
    createdAt: "2025-01-01",
  },

  runningData: [
    {
      date: "2025-01-04",
      distance: 5.8,
      duration: 38,
      caloriesBurned: 422,
      heartRate: {
        min: 140,
        max: 178,
        average: 163,
      },
    },
  ],
};
