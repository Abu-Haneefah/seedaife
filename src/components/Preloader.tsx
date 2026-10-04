'use client';

import React, { useEffect, useState } from 'react';
import { motionOff } from '@/lib/ticker';

export default function Preloader() {
  const [hidden, setHidden] = useState(true);
  const [isLifting, setIsLifting] = useState(false);

  useEffect(() => {
    const key = 'seedai_intro_seen';
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(key) === '1';
    } catch {
      // sessionStorage unavailable
    }

    if (seen || motionOff()) {
      setHidden(true);
      return;
    }

    // Show preloader
    setHidden(false);

    let done = false;
    const hide = (instant: boolean) => {
      if (done) return;
      done = true;
      try {
        window.sessionStorage.setItem(key, '1');
      } catch {
        // ignore
      }
      if (instant) {
        setHidden(true);
        return;
      }
      setIsLifting(true);
      setTimeout(() => {
        setHidden(true);
      }, 950);
    };

    const timer = setTimeout(() => {
      hide(false);
    }, 1950);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`preloader${isLifting ? ' is-lifting' : ''}`}
      id="preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading Seed AI Academy"
    >
      <div className="pre-stage">
        <svg className="pre-svg" viewBox="0 0 200 200" aria-hidden="true">
          <rect className="pre-tile" x="0" y="0" width="200" height="200" rx="44" fill="#2A1450" />
          <line className="pre-stem" x1="100" y1="70" x2="100" y2="52" stroke="#B8F23C" strokeWidth="5" strokeLinecap="round" />
          <path className="pre-leaf" d="M100 54 C100 40 112 32 128 30 C128 44 116 54 100 54Z" fill="#B8F23C" />
          <ellipse className="pre-seed" cx="100" cy="126" rx="23" ry="16" fill="#B8F23C" />
          <g className="pre-bot">
            <rect className="pre-part pre-head" x="52" y="70" width="96" height="84" rx="28" fill="#B8F23C" />
            <rect className="pre-part pre-ear pre-ear-l" x="38" y="104" width="20" height="36" rx="8" fill="#B8F23C" />
            <rect className="pre-part pre-ear pre-ear-r" x="142" y="104" width="20" height="36" rx="8" fill="#B8F23C" />
            <rect className="pre-part pre-neck" x="88" y="150" width="24" height="12" rx="4" fill="#B8F23C" />
            <rect className="pre-part pre-visor" x="66" y="92" width="68" height="40" rx="18" fill="#2A1450" />
            <rect className="pre-part pre-eye pre-eye-l" x="81" y="103" width="11" height="18" rx="5.5" fill="#B8F23C" />
            <rect className="pre-part pre-eye pre-eye-r" x="108" y="103" width="11" height="18" rx="5.5" fill="#B8F23C" />
          </g>
        </svg>
        <p className="pre-note">Planting your seed&hellip;</p>
      </div>
      <button
        className="pre-skip"
        id="preSkip"
        type="button"
        onClick={() => {
          try {
            window.sessionStorage.setItem('seedai_intro_seen', '1');
          } catch {}
          setHidden(true);
        }}
      >
        Skip intro
      </button>
    </div>
  );
}
