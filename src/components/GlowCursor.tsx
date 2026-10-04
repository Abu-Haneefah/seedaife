'use client';

import React, { useEffect, useRef } from 'react';
import { TICKER, lerp, isTouch, motionOff } from '@/lib/ticker';

export default function GlowCursor() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch() || motionOff()) return;
    if (!window.matchMedia('(min-width: 900px)').matches) return;

    const glow = glowRef.current;
    if (!glow) return;

    document.body.classList.add('has-cursor');
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y };

    const handlePointerMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const tick = (dt: number) => {
      cur.x = lerp(cur.x, pos.x, Math.min(dt * 7, 0.22));
      cur.y = lerp(cur.y, pos.y, Math.min(dt * 7, 0.22));
      glow.style.transform = `translate(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px)`;
    };

    TICKER.add(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      TICKER.remove(tick);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return <div ref={glowRef} className="glow-cursor" id="glowCursor" aria-hidden="true" />;
}
