import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { useHydrated } from "~/hooks/useHydrated";

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const hydrated = useHydrated();
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    // pas connecté => redirect login
    if (!isAuthenticated || !token) {
      navigate(`/login`, { replace: true });
    }
  }, [
    hydrated,
    isAuthenticated,
    token,
    navigate,
    location.pathname,
    location.search,
  ]);

  // utile pour conditionner tes hooks/API
  return { hydrated, isAuthenticated: hydrated && isAuthenticated && !!token };
}
