import { useState } from "react";

type LoginProfileFormProps = {
  onSubmit?: (data: { email: string; password: string }) => void;
};

function LoginProfileForm({ onSubmit }: LoginProfileFormProps) {
  // state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // comportements
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit?.({ email, password });

    // pour debug temporaire
    console.log("login submit", { email, password });
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Se connecter</button>
        <p>Mot de passe oublié ?</p>
      </form>
    </section>
  );
}

export default LoginProfileForm;
