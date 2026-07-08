import { useEffect, useState, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";

const slides = [
  { src: banner1, alt: "Banner 1" },
  { src: banner2, alt: "Banner 2" },
  { src: banner3, alt: "Banner 3" },
];

const AUTOPLAY_MS = 4500;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const goTo = useCallback(
    (index) => setCurrent((index + slides.length) % slides.length),
    []
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [paused]);

  /* Touch swipe support */
  const onTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    setTouchStart(null);
  };

  return (
    <section
      className="relative overflow-hidden w-full mx-auto md:my-6 md:rounded-2xl shadow-lg shadow-black/5"
      style={{
        maxWidth: "1200px",
        aspectRatio: "16/9",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, i) => {
        const active = i === current;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              opacity: active ? 1 : 0,
              zIndex: active ? 10 : 0,
              transition: "opacity 900ms ease-in-out",
              background: "#eae5e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        );
      })}

      {/* Dark gradient overlay — helps text/dots readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 15,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Prev / Next buttons — hidden on mobile, shown md+ */}
      <button
        onClick={prev}
        aria-label="Previous Slide"
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
        className="hidden md:flex"
      >
        <FiChevronLeft size={20} />
      </button>

      <button
        onClick={next}
        aria-label="Next Slide"
        style={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
        className="hidden md:flex"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          gap: 8,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              height: 6,
              width: current === i ? 28 : 6,
              borderRadius: 99,
              background: current === i ? "#fff" : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 300ms ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}