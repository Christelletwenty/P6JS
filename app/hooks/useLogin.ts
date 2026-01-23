import { useState } from "react";
import { login, type LoginRequest, type LoginResponse } from "../services/auth";

type UseLoginResult = {
  loading: boolean;
  error: string | null;
  submitLogin: (data: LoginRequest) => Promise<LoginResponse>;
};

export function useLogin(): UseLoginResult {
  // state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // comportements
  const submitLogin = async (data: LoginRequest): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const res = await login(data);
      return res;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur de connexion";
      setError(message);
      throw e; // important: on rethrow pour que la page puisse décider quoi faire (redirect etc.)
    } finally {
      setLoading(false);
    }
  };

  // return (API du hook)
  return { loading, error, submitLogin };
}
