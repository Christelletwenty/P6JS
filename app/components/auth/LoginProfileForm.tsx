import { useState } from "react";

type LoginProfileFormProps = {
  onSubmit?: (data: { username: string; password: string }) => void;
  loading?: boolean;
  error?: string | null;
};

function LoginProfileForm({
  onSubmit,
  loading = false,
  error = null,
}: LoginProfileFormProps) {
  // state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // comportements
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit?.({ username, password });
  };

  // render
  return (
    <section className="login-card">
      <h1>Transformez vos stats en résultats</h1>
      <h2>Se connecter</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Adresse email</label>
          <input
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p>Mot de passe oublié ?</p>
      </form>
    </section>
  );
}

export default LoginProfileForm;
