import React from 'react';
import './Loader.css';

/**
 * Reusable, premium loading spinner themed for Jyot's Collection.
 * Supports inline, container-level, or full-viewport loading layouts.
 */
export default function Loader({
  fullPage = false,
  size = 'md',
  text,
  dark = false,
  className = '',
}) {
  const containerClass = [
    'jc-loader-container',
    fullPage ? 'is-full-page' : 'is-inline',
    dark ? 'theme-dark' : 'theme-light',
    className,
  ].filter(Boolean).join(' ');

  const spinnerClass = `jc-loader-ring-wrapper size-${size}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="jc-loader-outer-ring" />
        <div className="jc-loader-inner-ring" />
        <div className="jc-loader-core" />
      </div>
      {text && <p className="jc-loader-text">{text}</p>}
    </div>
  );
}
