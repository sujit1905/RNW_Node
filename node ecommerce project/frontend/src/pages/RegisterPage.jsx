import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function safeRedirectPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  const decoded = decodeURIComponent(raw.trim());
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  return decoded;
}

const PERKS = [
  "Exclusive member-only deals & early access",
  "Track orders and manage returns easily",
  "Save your favorite products to wishlist",
  "Secure checkout with saved addresses",
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loginWithGoogle, isLoggedIn, user } = useAuth();
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]                 = useState("");
  const [form, setForm]                   = useState({ name: "", phone: "", email: "", password: "" });

  useEffect(() => {
    if (!isLoggedIn) return;
    const next = safeRedirectPath(searchParams.get("redirect"));
    if (next) { navigate(next); return; }
    navigate(user?.role === "admin" ? "/admin" : "/");
  }, [isLoggedIn, navigate, searchParams, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
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
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") return;
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-velura-50 lg:grid lg:grid-cols-2">
      {/* ─── Brand Panel ─── */}
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

        <Link to="/" className="relative z-10">
          <div className="flex flex-col">
            <span className="logo-velura text-white" style={{ fontSize: "1.5rem", letterSpacing: "0.18em" }}>VELURA</span>
            <span className="text-gold-500" style={{ fontSize: "0.5rem", letterSpacing: "0.25em", marginTop: "-1px" }}>WEAR THE MOMENT</span>
          </div>
        </Link>

        <div className="relative z-10">
          <div className="h-px w-12 bg-gold-500 mb-8" />
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-8"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}>
            Join VELURA.<br />
            <span className="gradient-text-gold">Discover your<br />perfect style.</span>
          </h2>
          <ul className="space-y-4">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-center gap-3 text-white/50 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(201,168,76,0.2)" }}>
                  <FiCheck size={11} className="text-gold-400" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/20 text-xs">
          © {new Date().getFullYear()} VELURA. All rights reserved.
        </p>
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

          <div className="mb-8">
            <p className="text-overline text-velura-400 mb-2">Create Account</p>
            <h1 className="text-3xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Join VELURA
            </h1>
            <p className="mt-2 text-sm text-velura-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-ink-900 hover:text-gold-600 underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* ── Google Sign-Up Button ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-velura-200 bg-white px-4 py-3.5 text-sm font-semibold text-ink-900 shadow-sm transition-all hover:border-velura-300 hover:shadow-md active:scale-[0.99] disabled:opacity-60 mb-6"
            id="google-register-btn"
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
            <span className="text-[10px] font-semibold uppercase tracking-widest text-velura-300">or register with email</span>
            <div className="h-px flex-1 bg-velura-200" />
          </div>

          <form className="space-y-4 relative" autoComplete="off" onSubmit={handleSubmit}>
            {/* Honeypot */}
            <div className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden whitespace-nowrap" aria-hidden="true">
              <label htmlFor="auth-decoy-user">Do not fill</label>
              <input id="auth-decoy-user" type="text" autoComplete="username" tabIndex={-1} />
              <label htmlFor="auth-decoy-pass">Do not fill</label>
              <input id="auth-decoy-pass" type="password" autoComplete="current-password" tabIndex={-1} />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-velura-400 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                <input
                  type="text"
                  placeholder="Your full name"
                  className="input-velura input-icon-left"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  id="register-name"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-velura-400 mb-2">
                Phone <span className="normal-case tracking-normal text-velura-300 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="input-velura input-icon-left"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  id="register-phone"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-velura-400 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                <input
                  type="email"
                  name="velura_email_reg"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className="input-velura input-icon-left"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  id="register-email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-velura-400 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-velura-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="velura_password_reg"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="input-velura input-icon-both"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  id="register-password"
                  required
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

            {error && (
              <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3 text-xs text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              id="register-submit"
              className="group flex w-full items-center justify-between rounded-2xl bg-ink-900 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-velura-800 disabled:opacity-60 hover:shadow-lg mt-2"
            >
              <span>{loading ? "Creating account…" : "Create Account"}</span>
              <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-velura-400">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-ink-900 transition-colors">Terms</Link>
            {" & "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-ink-900 transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
