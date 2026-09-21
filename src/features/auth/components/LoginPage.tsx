import { Fragment, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";
import agrobankLogo from "@/assets/logos/agrobank-logo.png";
import { strings } from "@/shared/strings";
import { useAuth } from "@/features/auth/context/AuthContext";
import "./LoginPage.css";

const REMEMBER_ME_KEY = "rememberMe";
const REMEMBERED_USERNAME_KEY = "rememberedUsername";

function readRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

function readRememberedUsername(): string {
  return readRememberMe() ? (localStorage.getItem(REMEMBERED_USERNAME_KEY) ?? "") : "";
}

const CHART_POINTS: Array<[number, number]> = [
  [40, 290],
  [120, 270],
  [190, 220],
  [260, 250],
  [330, 190],
  [410, 230],
  [490, 140],
  [560, 160],
];

const HERO_BARS = [28, 42, 58, 74, 90];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState<boolean>(readRememberMe);
  const [username, setUsername] = useState<string>(readRememberedUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = strings.auth;

  function persistRememberMe() {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, "true");
      localStorage.setItem(REMEMBERED_USERNAME_KEY, username.trim());
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(t.fieldRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username, password });
      persistRememberMe();
      navigate("/monitoring", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError(t.invalidCredentials);
      } else {
        setError(t.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      {/* ── Left branded hero ── */}
      <div className="login-hero-side">
        <div className="login-hero-bg" aria-hidden="true">
          <div className="hero-diamond hero-diamond--1" />
          <div className="hero-diamond hero-diamond--2" />
          <div className="hero-diamond hero-diamond--3" />

          <svg className="hero-dot-matrix" viewBox="0 0 120 180" fill="none">
            {Array.from({ length: 5 }).map((_, col) =>
              Array.from({ length: 8 }).map((_, row) => (
                <circle
                  key={`${col}-${row}`}
                  cx={12 + col * 24}
                  cy={12 + row * 22}
                  r="2"
                  fill="rgba(255, 255, 255, 0.35)"
                />
              )),
            )}
          </svg>

          <svg className="hero-chart-line" viewBox="0 0 600 400" preserveAspectRatio="none">
            <polyline
              points={CHART_POINTS.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {CHART_POINTS.map(([x, y], idx) => (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={[2, 4, 6].includes(idx) ? 5 : 4.5}
                fill="#FFFFFF"
                opacity="0.95"
              />
            ))}
          </svg>

          <div className="hero-bars">
            {HERO_BARS.map((height) => (
              <span key={height} className="hero-bar" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="hero-top">
          <div className="hero-brand">
            <img src={agrobankLogo} alt={strings.app.title} className="hero-brand-logo" />
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-subtitle">
            {t.heroSubtitle.split("\n").map((line, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        </div>

        <div className="hero-features">
          <div className="hero-feature-item">
            <ShieldCheck size={26} strokeWidth={1.8} className="hero-feature-icon" />
            <span className="hero-feature-label">{t.featureSafe}</span>
          </div>

          <div className="hero-feature-divider" />

          <div className="hero-feature-item">
            <Clock size={26} strokeWidth={1.8} className="hero-feature-icon" />
            <span className="hero-feature-label">{t.featureRealtime}</span>
          </div>

          <div className="hero-feature-divider" />

          <div className="hero-feature-item">
            <div className="hero-headset-wrap">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                <text
                  x="12"
                  y="11"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontWeight="bold"
                  fill="currentColor"
                  stroke="none"
                >
                  24/7
                </text>
              </svg>
            </div>
            <span className="hero-feature-label">{t.featureMonitoring}</span>
          </div>
        </div>
      </div>

      {/* ── Right form section ── */}
      <div className="login-form-side">
        <div className="login-card-wrap">
          <div className="login-card">
            <img src={agrobankLogo} alt={strings.app.title} className="login-card-logo" />
            <h2 className="login-card-title">{t.welcomeTitle}</h2>
            <p className="login-card-subtitle">{t.welcomeSubtitle}</p>

            {error && (
              <div className="login-alert-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form-inner" noValidate>
              <div className="input-group">
                <label htmlFor="login-username" className="input-label">
                  {t.username}
                </label>
                <div className="input-field-wrap">
                  <User size={18} className="input-icon-left" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={t.usernamePlaceholder}
                    autoFocus
                    autoComplete="username"
                    className="login-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="login-password" className="input-label">
                  {t.password}
                </label>
                <div className="input-field-wrap">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={t.passwordPlaceholder}
                    autoComplete="current-password"
                    className="login-input login-input--pw"
                  />
                  <button
                    type="button"
                    className="pw-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="remember-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span>{t.rememberMe}</span>
                </label>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="login-spinner" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={2} />
                    <span>{t.submit}</span>
                  </>
                )}
              </button>

              <div className="login-security-badge">
                <ShieldCheck size={16} strokeWidth={2} />
                <span>{t.trustLine}</span>
              </div>
            </form>
          </div>
        </div>

        <footer className="login-page-footer">
          © {new Date().getFullYear()} {t.footer}
        </footer>
      </div>
    </div>
  );
}