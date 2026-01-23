//Service pour call l'api d'authent

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
};

const API_URL = "http://localhost:8000";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Login failed");
  }

  return (await response.json()) as LoginResponse;
}
