import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function safeRedirectPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  const decoded = decodeURIComponent(raw.trim());
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  return decoded;
}

const BRAND_QUOTES = [
  { text: "Fashion is the armor to survive the reality of everyday life.", author: "Bill Cunningham" },
  { text: "Style is a way to say who you are without having to speak.", author: "Rachel Zoe" },
  { text: "Elegance is not about being noticed, it's about being remembered.", author: "Giorgio Armani" },
];

/* ── Google "G" SVG icon ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, isLoggedIn, user } = useAuth();
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]                 = useState("");
  const [form, setForm]                   = useState({ email: "", password: "" });
  const [quoteIndex]                      = useState(() => Math.floor(Math.random() * BRAND_QUOTES.length));

  useEffect(() => {
    localStorage.removeItem("remember_login");
    localStorage.removeItem("remember_email");
    localStorage.removeItem("remember_password");
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const next = safeRedirectPath(searchParams.get("redirect"));
    if (next) { navigate(next); return; }
    navigate(user?.role === "admin" ? "/admin" : "/");
  }, [isLoggedIn, navigate, searchParams, user?.role]);

  /* ── Email / Password submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login({ email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Firebase Google popup ── */
  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      await loginWithGoogle();
    } catch (err) {
      // User closed popup — not an error worth showing
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") return;
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const quote = BRAND_QUOTES[quoteIndex];

  return (
    <div className="min-h-screen bg-velura-50 lg:grid lg:grid-cols-2">
      {/* ─── Brand Panel (desktop) ─── */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080807 0%, #1a1a0e 50%, #0d0d0a 100%)" }}>
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full"
            style={{ background: "radial-gradient(circle, var(--color-gold-400), transparent)", transform: "translate(40%, -40%)" }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5 rounded-full"
            style={{ background: "radial-gradient(circle, var(--color-gold-500), transparent)", transform: "translate(-30%, 30%)" }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10">
          <div className="flex flex-col">
            <span className="logo-velura text-white" style={{ fontSize: "1.5rem", letterSpacing: "0.18em" }}>VELURA</span>
            <span className="text-gold-500" style={{ fontSize: "0.5rem", letterSpacing: "0.25em", marginTop: "-1px" }}>WEAR THE MOMENT</span>
          </div>
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <div className="h-px w-12 bg-gold-500 mb-8" />
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}>
            Welcome back.<br />
            <span className="gradient-text-gold">Pick up where<br />you left off.</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Sign in to access your saved pieces, track orders, and explore new arrivals tailored to your taste.
          </p>
        </div>

        {/* Quote */}
        <blockquote className="relative z-10">
          <p className="text-white/30 text-sm italic leading-relaxed mb-3">"{quote.text}"</p>
          <footer className="text-white/20 text-xs">— {quote.author}</footer>
        </blockquote>
      </aside>

      {/* ─── Form Panel ─── */}
      <main className="flex min-h-screen lg:min-h-0 items-center justify-center px-6 py-10 sm:px-10 bg-velura-50">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/">
              <div className="inline-flex flex-col items-center">
                <span className="logo-velura text-ink-900" style={{ fontSize: "1.75rem", letterSpacing: "0.18em" }}>VELURA</span>
                <span className="text-gold-600 text-[0.45rem] tracking-[0.25em] uppercase">Wear the Moment</span>
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-overline text-velura-400 mb-2">Sign In</p>
            <h1 className="text-3xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-velura-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-ink-900 hover:text-gold-600 underline underline-offset-4 transition-colors">
                Create one
              </Link>
            </p>
          </div>

          {/* ── Google Sign-In Button ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-velura-200 bg-white px-4 py-3.5 text-sm font-semibold text-ink-900 shadow-sm transition-all hover:border-velura-300 hover:shadow-md active:scale-[0.99] disabled:opacity-60 mb-6"
            id="google-signin-btn"
          >
            {googleLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-velura-200 border-t-ink-900 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-velura-200" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-velura-300">or sign in with email</span>
            <div className="h-px flex-1 bg-velura-200" />
          </div>

          {/* Form */}
          <form className="space-y-5 relative" autoComplete="off" onSubmit={handleSubmit}>
            {/* Anti-autofill decoys */}
            <div className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden whitespace-nowrap" aria-hidden="true">
              <label htmlFor="auth-decoy-user">Do not fill</label>
              <input id="auth-decoy-user" type="text" autoComplete="username" tabIndex={-1} />
              <label htmlFor="auth-decoy-pass">Do not fill</label>
              <input id="auth-decoy-pass" type="password" autoComplete="current-password" tabIndex={-1} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-velura-400 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                <input
                  type="email"
                  name="velura_email_in"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className="input-velura input-icon-left"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  id="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-velura-400">Password</label>
                <button type="button" className="text-xs text-velura-400 hover:text-ink-900 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="velura_password_in"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-velura input-icon-both"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-velura-400 hover:text-ink-900 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-velura-300 text-ink-900 focus:ring-0 focus:ring-offset-0 accent-ink-900" />
              <span className="text-sm text-velura-600">Remember me on this device</span>
            </label>

            {error && (
              <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3 text-xs text-danger">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              id="login-submit"
              className="group flex w-full items-center justify-between rounded-2xl bg-ink-900 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-velura-800 disabled:opacity-60 hover:shadow-lg"
            >
              <span>{loading ? "Signing in…" : "Sign In"}</span>
              <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-velura-400">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-ink-900 transition-colors">Terms</Link>
            {" & "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-ink-900 transition-colors">Privacy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
