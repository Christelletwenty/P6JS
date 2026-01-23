import { createContext, useContext, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  userId: string | null;
};

type AuthContextValue = AuthState & {
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_TOKEN_KEY = "sportsee_token";
const STORAGE_USERID_KEY = "sportsee_userId";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // state (initialisé depuis localStorage)
  const isBrowser = typeof window !== "undefined";

  const [token, setToken] = useState<string | null>(() => {
    if (!isBrowser) return null;
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  });

  const [userId, setUserId] = useState<string | null>(() => {
    if (!isBrowser) return null;
    return localStorage.getItem(STORAGE_USERID_KEY);
  });

  // comportements
  const setAuth = (newToken: string, newUserId: string) => {
    setToken(newToken);
    setUserId(newUserId);

    if (isBrowser) {
      localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
      localStorage.setItem(STORAGE_USERID_KEY, newUserId);
    }
  };

  const clearAuth = () => {
    setToken(null);
    setUserId(null);

    if (isBrowser) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USERID_KEY);
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      userId,
      setAuth,
      clearAuth,
      isAuthenticated: Boolean(token),
    };
  }, [token, userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
