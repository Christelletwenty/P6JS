import type { ApiRunningEntry, ApiUser } from "~/types/api";
import type { UserProfile } from "~/types/profile";

const API_URL = "http://localhost:8000";

export type UserActivityParams = {
  startWeek: string; // "YYYY-MM-DD"
  endWeek: string; // "YYYY-MM-DD"
};

export async function fetchUserActivity(
  token: string,
  params: UserActivityParams,
): Promise<ApiRunningEntry[]> {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${API_URL}/api/user-activity?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? "Failed to fetch user activity");
  }

  return (await res.json()) as ApiRunningEntry[];
}

export type UserInfoApiResponse = {
  profile: UserProfile;
  statistics: {
    totalDistance: string; // "123.4"
    totalSessions: number;
    totalDuration: number;
  };
};

export async function fetchUserInfo(
  token: string,
): Promise<UserInfoApiResponse> {
  const res = await fetch(`${API_URL}/api/user-info`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? "Failed to fetch user info");
  }

  return (await res.json()) as UserInfoApiResponse;
}
