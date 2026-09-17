import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "antd";
import { AxiosError } from "axios";
import { strings } from "@/shared/strings";
import { useAuth } from "@/features/auth/context/AuthContext";
import "./LoginPage.css";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(strings.auth.fieldRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username, password });
      navigate("/monitoring", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError(strings.auth.invalidCredentials);
      } else {
        setError(strings.auth.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__hero">
        <div className="login-page__hero-pattern" aria-hidden="true">
          <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="140" width="18" height="40" rx="3" fill="rgba(255,255,255,0.18)" />
            <rect x="48" y="110" width="18" height="70" rx="3" fill="rgba(255,255,255,0.22)" />
            <rect x="76" y="90" width="18" height="90" rx="3" fill="rgba(255,255,255,0.16)" />
            <rect x="104" y="120" width="18" height="60" rx="3" fill="rgba(255,255,255,0.25)" />
            <path
              d="M20 70 L90 40 L150 55 L220 20 L300 45"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="login-page__hero-content">
          <div className="login-page__logo">
            <span className="login-page__logo-mark">A</span>
            <span className="login-page__logo-text">{strings.app.title}</span>
          </div>
          <h1 className="login-page__title">{strings.app.subtitle}</h1>
          <p className="login-page__tagline">{strings.auth.tagline}</p>
        </div>
      </div>
      <div className="login-page__panel">
        <form className="login-page__card" onSubmit={handleSubmit} noValidate>
          <h2 className="login-page__card-title">{strings.auth.submit}</h2>
          <label className="login-page__field" htmlFor="username">
            <span className="login-page__label">{strings.auth.username}</span>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={strings.auth.usernamePlaceholder}
              autoComplete="username"
              size="large"
            />
          </label>
          <label className="login-page__field" htmlFor="password">
            <span className="login-page__label">{strings.auth.password}</span>
            <Input.Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={strings.auth.passwordPlaceholder}
              autoComplete="current-password"
              size="large"
            />
          </label>
          {error && (
            <p className="login-page__error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isSubmitting}
            className="login-page__submit"
          >
            {isSubmitting ? strings.auth.submitting : strings.auth.submit}
          </Button>
          <p className="login-page__trust">{strings.auth.trustLine}</p>
        </form>
      </div>
    </div>
  );
}
