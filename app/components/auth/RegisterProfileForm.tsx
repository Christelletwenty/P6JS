import type { UserProfile } from "~/types/profile";

type RegisterProfileProps = {
  user: UserProfile;
};

function RegisterProfileForm({ user }: RegisterProfileProps) {
  // state

  // comportements

  // render
  return (
    <section>
      <h1>Transformez vos stats en résultats</h1>
      <h2>Créer un compte</h2>
      <form action="submit">
        <label>Pseudo</label>
        <input type="text" />
        <label>Adresse email</label>
        <input type="email" />
        <label>Mot de passe</label>
        <input type="password" />
        <button>Se connecter</button>
      </form>
      <div>
        <img src="runners.jpg" alt="Runners Image" />
      </div>
    </section>
  );
}

export default RegisterProfileForm;
