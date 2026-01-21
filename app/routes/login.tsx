import LoginProfileForm from "~/components/auth/LoginProfileForm";

export default function Login() {
  return (
    <main className="login-page">
      <header className="login-header">
        <img src="/Logo.svg" alt="SportSee" />
      </header>

      <section className="login-left">
        <LoginProfileForm />
      </section>

      <aside className="login-right">
        <img src="/runners.jpg" alt="Runners" />
        <p className="login-quote">
          Analysez vos performances en un clin d'œil, suivez vos progrès et
          atteignez vos objectifs.
        </p>
      </aside>
    </main>
  );
}
