import { useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { useLogin } from "~/hooks/useLogin";
import LoginProfileForm from "~/components/auth/LoginProfileForm";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { loading, error, submitLogin } = useLogin();

  const handleLogin = async (data: { username: string; password: string }) => {
    const response = await submitLogin(data);

    setAuth(response.token, response.userId);
    navigate("/profile", { replace: true });

    console.log("LOGIN OK", response);
  };
  return (
    <main className="login-page">
      <header className="login-header">
        <img src="/Logo.svg" alt="SportSee" />
      </header>

      <section className="login-left">
        <LoginProfileForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
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
