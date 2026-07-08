import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  FiRotateCcw, FiShield, FiTruck, FiArrowRight,
  FiChevronLeft, FiChevronRight, FiSearch,
} from "react-icons/fi";
import { API_BASE_URL } from "../lib/api";

/* ── Intersection Observer hook for scroll-reveal ── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Hero Section ── */
function HeroSection({ categories }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      headline: ["Wear the", "Moment."],
      sub: "Discover curated fashion that tells your story",
      cta: "Explore Collection",
      ctaPath: "/category",
      bg: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)",
      accent: "var(--color-gold-500)",
    },
    {
      headline: ["New Season,", "New You."],
      sub: "Fresh arrivals crafted for the modern woman",
      cta: "Shop New Arrivals",
      ctaPath: "/category?tag=new-arrival",
      bg: "linear-gradient(135deg, #1a0a00 0%, #2d1500 50%, #1a0a00 100%)",
      accent: "var(--color-gold-400)",
    },
    {
      headline: ["Premium.", "Affordable."],
      sub: "Luxury fashion without the luxury price tag",
      cta: "Shop Now",
      ctaPath: "/category",
      bg: "linear-gradient(135deg, #000814 0%, #001d3d 50%, #000814 100%)",
      accent: "var(--color-gold-500)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section
      className="relative min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden"
      style={{ background: slide.bg, transition: "background 1s ease" }}
    >
      {/* ── Decorative Elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circle accent */}
        <div
          className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }}
        />
        <div
          className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container-main relative z-10 py-20 sm:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8 animate-fade-up">
            <span className="h-px w-8 bg-gold-500" />
            <span className="text-overline text-gold-500">VELURA Collection 2026</span>
          </div>

          {/* Headline — changes on slide */}
          <h1
            key={currentSlide}
            className="text-hero text-white mb-6 animate-fade-up"
            style={{ animationDuration: "0.6s" }}
          >
            {slide.headline[0]}
            <br />
            <span className="gradient-text-gold">{slide.headline[1]}</span>
          </h1>

          {/* Sub */}
          <p
            key={`sub-${currentSlide}`}
            className="text-white/50 text-lg sm:text-xl mb-8 sm:mb-10 max-w-lg leading-relaxed animate-fade-up delay-200"
          >
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12 sm:mb-16 animate-fade-up delay-300">
            <button
              onClick={() => navigate(slide.ctaPath)}
              className="btn-gold text-sm px-7 py-4"
            >
              {slide.cta}
              <FiArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/category")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 1.75rem",
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: "100px",
                backdropFilter: "blur(8px)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
              }}
            >
              Browse All
            </button>
          </div>

          {/* Category Quick Links */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-up delay-400">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category?cat=${encodeURIComponent(cat.name)}`}
                  className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentSlide
                ? "w-8 h-1.5 bg-gold-500"
                : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="absolute bottom-10 right-8 hidden sm:flex flex-col items-center gap-2">
        <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase rotate-90 origin-center">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}

/* ── Trust Strip ── */
function TrustStrip() {
  const [ref, visible] = useScrollReveal();
  const items = [
    { icon: FiTruck, text: "Free Shipping on ₹999+" },
    { icon: FiRotateCcw, text: "7 Days Easy Returns" },
    { icon: FiShield, text: "100% Authentic Products" },
  ];

  return (
    <section className="bg-ink-900 border-y border-white/5">
      <div
        ref={ref}
        className={`container-main py-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-16">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(201,168,76,0.15)" }}>
                <item.icon size={13} className="text-gold-500" />
              </div>
              <span className="text-white/60 text-xs sm:text-sm font-medium tracking-wide">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Marquee Strip ── */
function MarqueeStrip() {
  const items = ["VELURA", "Wear the Moment", "New Arrivals", "Premium Fashion", "Crafted with Care", "Free Returns"];
  return (
    <div className="overflow-hidden py-3" style={{ background: "var(--color-gold-600)" }}>
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-sm font-semibold text-white/90 uppercase tracking-[0.15em] whitespace-nowrap">
            {item} <span className="mx-4 opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ eyebrow, title, subtitle, cta, ctaPath }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div>
        {eyebrow && <p className="section-label">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="text-velura-500 text-sm mt-2 max-w-md">{subtitle}</p>}
      </div>
      {cta && (
        <Link
          to={ctaPath || "/category"}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-900 hover:text-gold-600 border-b border-ink-900 hover:border-gold-500 pb-0.5 transition-all shrink-0"
        >
          {cta} <FiArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ── Static fallback categories (shown while API loads or if empty) ── */
const STATIC_CATEGORIES = [
  { name: "Sarees", emoji: "🥻", gradient: "linear-gradient(135deg,#7c3aed,#a855f7)" },
  { name: "Kurtis", emoji: "👘", gradient: "linear-gradient(135deg,#b45309,#d97706)" },
  { name: "Lehengas", emoji: "👗", gradient: "linear-gradient(135deg,#be185d,#ec4899)" },
  { name: "Suits", emoji: "🧥", gradient: "linear-gradient(135deg,#0f766e,#14b8a6)" },
  { name: "Tops", emoji: "👚", gradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)" },
  { name: "Dupattas", emoji: "🧣", gradient: "linear-gradient(135deg,#c2410c,#f97316)" },
  { name: "Ethnic Wear", emoji: "🌸", gradient: "linear-gradient(135deg,#4d7c0f,#84cc16)" },
  { name: "Accessories", emoji: "💍", gradient: "linear-gradient(135deg,#1e3a5f,#2563eb)" },
];

/* ── Categories Grid ── */
function CategoriesSection({ categories, loading }) {
  const navigate = useNavigate();
  const [ref, visible] = useScrollReveal(0.1);

  /* Use real API categories if available, otherwise fall back to static */
  const displayCats = categories.length > 0 ? categories.slice(0, 8) : null;

  return (
    <section className="section-padding" id="categories-section">
      <div className="container-main">
        <SectionHeader
          eyebrow="Explore"
          title="Shop by Category"
          subtitle="Every occasion deserves the perfect outfit"
          cta="All Categories"
          ctaPath="/category"
        />

        {/* ── Skeleton while loading ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <div className="shimmer w-full h-full" />
              </div>
            ))}
          </div>
        ) : displayCats ? (
          /* ── Real API category cards ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayCats.map((cat, i) => (
              <button
                key={cat._id || i}
                onClick={() => navigate(`/category?cat=${encodeURIComponent(cat.name)}`)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer text-left"
                style={{ aspectRatio: "3/4", animation: "fadeUp 0.5s ease both", animationDelay: `${i * 60}ms` }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                  <h3 className="text-white font-semibold text-sm sm:text-base leading-tight mb-1"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gold-400 text-[11px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span>Browse</span><FiArrowRight size={10} />
                  </div>
                </div>
                <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        ) : (
          /* ── Static fallback cards (when API returns empty) ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {STATIC_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => navigate(`/category?cat=${encodeURIComponent(cat.name)}`)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer text-left"
                style={{ aspectRatio: "3/4", animation: "fadeUp 0.5s ease both", animationDelay: `${i * 60}ms` }}
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ background: cat.gradient }}
                />
                {/* Decorative pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)",
                  }}
                />
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: "linear-gradient(135deg, white 0%, transparent 60%)" }}
                />
                {/* Big emoji icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-5xl sm:text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 drop-shadow-lg"
                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
                  >
                    {cat.emoji}
                  </span>
                </div>
                {/* Bottom content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                  <h3 className="text-white font-semibold text-sm sm:text-base leading-tight mb-1"
                    style={{ fontFamily: "var(--font-display)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/80 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 translate-y-1 group-hover:translate-y-0 group-hover:text-yellow-300">
                    <span>Browse</span><FiArrowRight size={10} />
                  </div>
                </div>
                {/* Corner accents */}
                <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Product Grid Section ── */
function ProductSection({ eyebrow, title, products, ctaPath, filter, loading }) {
  const [ref, visible] = useScrollReveal(0.05);

  const displayed = filter ? products.filter(filter).slice(0, 8) : products.slice(0, 8);

  return (
    <section className="section-padding">
      <div className="container-main">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          cta="View All"
          ctaPath={ctaPath || "/category"}
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="shimmer aspect-product" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-3 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                  <div className="shimmer h-4 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={ref}
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {displayed.map((product, i) => (
              <div
                key={product._id}
                className="opacity-0-init animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
              >
                <ProductCard product={{ ...product, id: product._id }} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to={ctaPath || "/category"}
            className="inline-flex items-center gap-2 btn-outline text-sm px-6 py-3"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Stats Section ── */
function StatsSection() {
  const [ref, visible] = useScrollReveal(0.2);
  const stats = [
    { value: 10000, suffix: "+", label: "Happy Customers" },
    { value: 500, suffix: "+", label: "Unique Styles" },
    { value: 50, suffix: "+", label: "Cities Served" },
    { value: 4, suffix: ".8★", label: "Average Rating" },
  ];

  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--color-velura-100)" }}>
      <div className="container-main">
        <div
          ref={ref}
          className={`grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 transition-all duration-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-2"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {visible ? (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </p>
              <p className="text-velura-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Brand Story ── */
function BrandStory() {
  const [ref, visible] = useScrollReveal(0.2);
  return (
    <section className="section-padding bg-ink-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-5"
          style={{ background: "radial-gradient(circle, var(--color-gold-500), transparent)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5"
          style={{ background: "radial-gradient(circle, var(--color-gold-500), transparent)" }} />
      </div>
      <div
        ref={ref}
        className={`container-main relative z-10 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="section-label mb-4">Our Story</p>
          <h2 className="section-title text-white mb-6 sm:mb-8">
            Fashion That <span className="gradient-text-gold">Feels Like You</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-4">
            VELURA was born from a simple belief: every woman deserves fashion that makes her feel
            extraordinary — without extraordinary prices. We curate each piece with intention.
          </p>
          <p className="text-white/40 text-sm sm:text-base leading-relaxed mb-10">
            From timeless sarees to contemporary silhouettes, our collection bridges tradition and
            modernity — crafted for the woman who wears her story.
          </p>
          <Link to="/category" className="btn-gold text-sm px-7 py-4 inline-flex items-center gap-2">
            Explore Our Collection <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const [ref, visible] = useScrollReveal(0.1);
  const reviews = [
    {
      name: "Priya S.",
      location: "Mumbai",
      text: "Absolutely love the quality! The saree I ordered was exactly as described and the delivery was super fast.",
      rating: 5,
    },
    {
      name: "Anjali M.",
      location: "Delhi",
      text: "VELURA has the best kurtas. I've ordered 5 times already and never been disappointed. Highly recommend!",
      rating: 5,
    },
    {
      name: "Deepika R.",
      location: "Bangalore",
      text: "The packaging was beautiful and the lehenga was stunning. Wore it to my cousin's wedding — got so many compliments!",
      rating: 5,
    },
  ];

  return (
    <section className="section-padding" style={{ background: "var(--color-velura-50)" }}>
      <div className="container-main">
        <SectionHeader eyebrow="Reviews" title="What Our Customers Say" />
        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="card-elevated p-6 sm:p-7"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} className="text-gold-500" style={{ fontSize: 14 }}>★</span>
                ))}
              </div>
              <p className="text-ink-700 text-sm leading-relaxed mb-5">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "var(--color-gold-600)" }}>
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{review.name}</p>
                  <p className="text-xs text-velura-400">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Brand Promise ── */
function BrandPromise() {
  const [ref, visible] = useScrollReveal(0.15);
  const promises = [
    { icon: FiTruck, title: "COD Available", desc: "Pay comfortably on delivery across India" },
    { icon: FiRotateCcw, title: "Easy Returns", desc: "7-day hassle-free return policy" },
    { icon: FiShield, title: "100% Authentic", desc: "Genuine quality you can trust" },
  ];

  return (
    <section className="py-14 sm:py-20 bg-ink-900">
      <div className="container-main">
        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {promises.map((item, i) => (
            <div
              key={i}
              className="group flex sm:flex-col items-center sm:items-start gap-4 p-5 sm:p-6 rounded-2xl border border-white/5 hover:border-gold-500/30 hover:bg-white/3 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-gold-500/20"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <item.icon size={20} className="text-gold-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm sm:text-base mb-1"
                  style={{ fontFamily: "var(--font-display)" }}>
                  {item.title}
                </h4>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════ MAIN HOME PAGE ══════════════════ */
export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`),
        ]);
        if (!productsRes.ok || !categoriesRes.ok) throw new Error("Failed to fetch data");
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allowedCategories = new Set(categories.map((c) => c.name));
  const visibleProducts = products.filter((p) => allowedCategories.has(p.category));

  // Segment products
  const newArrivals = products.filter((p) => p.tag === "new-arrival");
  const bestSellers = products.filter((p) => p.tag === "best-seller");
  const trending = products.filter((p) => p.tag === "trending");

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-velura-50">
        <div className="text-center px-4 py-16 max-w-md">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-headline text-ink-900 mb-3">Backend not connected</h2>
          <p className="text-velura-500 text-sm mb-1">{error}</p>
          <p className="text-velura-400 text-xs">Make sure the backend is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-velura-50">
      <HeroSection categories={categories} />
      <TrustStrip />
      <CategoriesSection categories={categories} loading={loading} />
      <MarqueeStrip />

      {/* Featured / All Products */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionHeader
            eyebrow="Handpicked"
            title="Products For You"
            subtitle={categories.map((c) => c.name).join(" · ")}
            cta="View All"
            ctaPath="/category"
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="shimmer aspect-product" />
                  <div className="p-4 space-y-2">
                    <div className="shimmer h-3 rounded w-3/4" />
                    <div className="shimmer h-3 rounded w-1/2" />
                    <div className="shimmer h-4 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {visibleProducts.slice(0, 8).map((product, i) => (
                <div
                  key={product._id}
                  className="opacity-0-init animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
                >
                  <ProductCard product={{ ...product, id: product._id }} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 text-center sm:hidden">
            <Link to="/category" className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
              View All Products <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {(newArrivals.length > 0 || loading) && (
        <ProductSection
          eyebrow="Just Landed"
          title="New Arrivals"
          products={newArrivals.length > 0 ? newArrivals : visibleProducts}
          ctaPath="/category?tag=new-arrival"
          loading={loading}
        />
      )}

      <StatsSection />

      {/* Best Sellers */}
      {(bestSellers.length > 0 || loading) && (
        <section className="section-padding bg-white">
          <ProductSection
            eyebrow="Customer Favorites"
            title="Best Sellers"
            products={bestSellers.length > 0 ? bestSellers : visibleProducts.slice(4)}
            ctaPath="/category?tag=best-seller"
            loading={loading}
          />
        </section>
      )}

      <BrandStory />
      <Testimonials />
      <BrandPromise />
    </div>
  );
}
