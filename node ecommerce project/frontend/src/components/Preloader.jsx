import { useEffect, useState } from 'react';
import './Preloader.css';

export default function Preloader({ isLoading }) {
  const [render, setRender] = useState(true);
  const [fade, setFade] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setFade(true);
      const t = setTimeout(() => setRender(false), 800);
      return () => clearTimeout(t);
    }
  }, [isLoading, minTimeElapsed]);

  if (!render) return null;

  return (
    <div className={`jc-preloader ${fade ? 'is-leaving' : ''}`}>
      <div className="jc-inner">
        <div className="jc-logo-box">
          <span className="preloader-text-logo">V</span>
        </div>
        <h1 className="jc-brand">VELURA</h1>
        <p className="jc-tagline">Wear the Moment</p>
        <div className="jc-preloader-bar">
          <div className="jc-preloader-progress" />
        </div>
      </div>
    </div>
  );
}
