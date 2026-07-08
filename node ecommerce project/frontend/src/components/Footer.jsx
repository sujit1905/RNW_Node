import { Link } from "react-router-dom";
import {
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Footer() {
  const { isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const shopLinks = [
    { label: "All Products", path: "/category" },
    { label: "New Arrivals", path: "/category?tag=new-arrival" },
    { label: "Best Sellers", path: "/category?tag=best-seller" },
    { label: "Trending Now", path: "/category?tag=trending" },
    { label: "Sale", path: "/category" },
  ];

  const helpLinks = [
    { label: "My Account", path: "/dashboard" },
    { label: "Track Order", path: "/dashboard" },
    { label: "Returns", path: "/dashboard" },
    { label: "Contact Us", path: "/" },
  ];

  return (
    <footer
      className={`bg-velura-dark text-white/70 ${isLoggedIn ? "pb-20 md:pb-0" : ""}`}
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* ── Newsletter Strip ── */}
      <div style={{ background: "linear-gradient(135deg, var(--color-gold-600), var(--color-gold-800))" }}>
        <div className="container-main py-10 sm:py-12">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="text-center md:text-left md:flex-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-100/80 mb-2">
                Exclusive Access
              </p>
              <h3
                className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                Join the VELURA Circle
              </h3>
              <p className="text-white/70 text-sm mt-2">
                First access to new drops, exclusive offers & style edits.
              </p>
            </div>
            <div className="w-full md:w-auto md:flex-1 max-w-md">
              {subscribed ? (
                <div className="flex items-center gap-3 bg-white/15 rounded-2xl px-5 py-4 border border-white/20">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-white font-semibold text-sm">You're in!</p>
                    <p className="text-white/70 text-xs mt-0.5">Welcome to the VELURA family.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 rounded-2xl bg-white/15 border border-white/20 px-4 py-3.5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
                    id="newsletter-email"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-white text-gold-700 rounded-2xl px-5 py-3.5 font-semibold text-sm hover:bg-gold-50 transition-colors flex items-center gap-2"
                  >
                    Join <FiArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ── */}
      <div className="container-main pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <div className="flex flex-col">
                <span
                  className="logo-velura text-white"
                  style={{ fontSize: "1.5rem", letterSpacing: "0.18em" }}
                >
                  VELURA
                </span>
                <span
                  className="text-gold-500"
                  style={{ fontSize: "0.5rem", letterSpacing: "0.25em", marginTop: "-1px" }}
                >
                  WEAR THE MOMENT
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-white/40 max-w-[220px] mb-5">
              Curating premium fashion for the modern woman. Quality crafted with care.
            </p>
            <div className="flex gap-2.5">
              {[
                { Icon: FiInstagram, href: "#", label: "Instagram" },
                { Icon: FiFacebook, href: "#", label: "Facebook" },
                { Icon: FiTwitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-white/40 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4
              className="text-white font-semibold text-sm mb-5 tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200 hover:pl-1 block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4
              className="text-white font-semibold text-sm mb-5 tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Help
            </h4>
            <ul className="space-y-3">
              {helpLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200 hover:pl-1 block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-semibold text-sm mb-5 tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Contact
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <FiMapPin size={14} className="text-gold-500 mt-0.5 shrink-0" />
                <span className="text-sm text-white/40 leading-relaxed">
                  12 Fashion Avenue, Mumbai, MH 400001
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiPhone size={14} className="text-gold-500 shrink-0" />
                <a href="tel:+919876543210" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FiMail size={14} className="text-gold-500 shrink-0" />
                <a href="mailto:hello@velura.in" className="text-sm text-white/40 hover:text-white/70 transition-colors break-all">
                  hello@velura.in
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="divider-subtle mx-4 sm:mx-8 md:mx-16" />

      {/* ── Bottom Bar ── */}
      <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/25 text-center sm:text-left">
          © {new Date().getFullYear()} VELURA. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/20">We accept</span>
          <div className="flex gap-1.5">
            {["UPI", "COD", "CARD"].map((method) => (
              <span
                key={method}
                className="text-[10px] text-white/40 font-semibold tracking-wide px-2 py-1 rounded"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
