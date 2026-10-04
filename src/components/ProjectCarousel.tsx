'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TICKER, lerp, clampNum, isTouch, motionOff, debounce } from '@/lib/ticker';

interface ProjectCardData {
  title: string;
  desc: string;
  art: React.ReactNode;
}

const CARDS: ProjectCardData[] = [
  {
    title: 'An AI-made video',
    desc: 'A short film or story, scripted, voiced and edited with AI tools.',
    art: (
      <svg viewBox="0 0 120 90" aria-hidden="true">
        <rect x="6" y="10" width="108" height="70" rx="14" fill="#2A1450" />
        <rect x="16" y="20" width="88" height="50" rx="10" fill="#3B1F6D" />
        <circle cx="60" cy="45" r="14" fill="#B8F23C" />
        <path d="M56 39 L69 45 L56 51 Z" fill="#2A1450" />
      </svg>
    ),
  },
  {
    title: 'A published website',
    desc: 'A live 3 to 4 page site with your own design and copy.',
    art: (
      <svg viewBox="0 0 120 90" aria-hidden="true">
        <rect x="6" y="12" width="108" height="66" rx="14" fill="#2A1450" />
        <rect x="14" y="20" width="92" height="12" rx="6" fill="#B8F23C" />
        <rect x="14" y="38" width="54" height="8" rx="4" fill="#A98BFF" />
        <rect x="14" y="52" width="76" height="6" rx="3" fill="#FFF8E7" opacity=".55" />
        <rect x="14" y="62" width="40" height="6" rx="3" fill="#FFF8E7" opacity=".35" />
      </svg>
    ),
  },
  {
    title: 'A full app with a database',
    desc: 'Accounts, data and deployment, built by vibe-coding with AI.',
    art: (
      <svg viewBox="0 0 120 90" aria-hidden="true">
        <rect x="6" y="10" width="70" height="70" rx="14" fill="#2A1450" />
        <rect x="14" y="20" width="54" height="10" rx="5" fill="#A98BFF" />
        <rect x="14" y="37" width="30" height="6" rx="3" fill="#FFF8E7" opacity=".5" />
        <rect x="14" y="49" width="44" height="6" rx="3" fill="#FFF8E7" opacity=".35" />
        <rect x="14" y="61" width="36" height="11" rx="5.5" fill="#B8F23C" />
        <ellipse cx="98" cy="26" rx="17" ry="7" fill="#B8F23C" />
        <rect x="81" y="26" width="34" height="24" fill="#B8F23C" />
        <ellipse cx="98" cy="50" rx="17" ry="7" fill="#94CC25" />
      </svg>
    ),
  },
  {
    title: 'An AI agent that saves you hours',
    desc: 'One automated workflow for your job, from calendar to email.',
    art: (
      <svg viewBox="0 0 120 90" aria-hidden="true">
        <circle cx="46" cy="46" r="30" fill="#2A1450" />
        <circle cx="46" cy="46" r="21" fill="#FFF8E7" />
        <rect x="44" y="32" width="4" height="16" rx="2" fill="#2A1450" />
        <rect x="46" y="44" width="14" height="4" rx="2" fill="#2A1450" />
        <path d="M86 18 L70 50 H84 L76 74 L100 40 H86 Z" fill="#B8F23C" />
      </svg>
    ),
  },
  {
    title: 'An animated Scratch game',
    desc: 'A story and game with characters, sound and score, built block by block.',
    art: (
      <svg viewBox="0 0 120 90" aria-hidden="true">
        <rect x="12" y="14" width="52" height="16" rx="8" fill="#B8F23C" />
        <rect x="22" y="36" width="62" height="16" rx="8" fill="#A98BFF" />
        <rect x="32" y="58" width="52" height="16" rx="8" fill="#FF6F61" />
        <circle cx="100" cy="22" r="6" fill="#2A1450" />
        <path
          d="M96 66 l8-8 4 4 8-10"
          stroke="#2A1450"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function ProjectCarousel() {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  const go = useCallback((idx: number) => {
    setActive((idx + CARDS.length) % CARDS.length);
  }, []);

  const next = useCallback(() => {
    go(active + 1);
  }, [active, go]);

  const prev = useCallback(() => {
    go(active - 1);
  }, [active, go]);

  const toggleFlip = (idx: number) => {
    setFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Card 3D transform layout
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const w = vp.clientWidth || 900;
    const gap = Math.max(74, Math.min(w * 0.2, 170));

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      let d = (i - active + CARDS.length) % CARDS.length;
      if (d > CARDS.length / 2) d -= CARDS.length;
      const abs = Math.abs(d);

      card.style.transform = `translateX(${d * gap}px) translateZ(${-abs * 200}px) rotateY(${d * -30}deg)`;
      card.style.opacity = abs > 2 ? '0' : String(Math.max(0.22, 1 - abs * 0.36));
      card.style.filter = abs === 0 ? 'none' : 'brightness(0.62)';
      card.style.zIndex = String(20 - abs);
      card.style.pointerEvents = abs === 0 ? 'auto' : 'none';
      card.classList.toggle('is-active', abs === 0);
      if (abs === 0) {
        card.removeAttribute('inert');
      } else {
        card.setAttribute('inert', '');
      }

      const btn = card.querySelector('.cf-inner') as HTMLElement | null;
      if (btn) btn.tabIndex = abs === 0 ? 0 : -1;
    });
  }, [active]);

  // Autoplay
  useEffect(() => {
    if (motionOff()) return;
    const cf = carouselRef.current;
    if (!cf) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const play = () => {
      if (!timer && !motionOff()) {
        timer = setInterval(next, 5200);
      }
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    play();
    cf.addEventListener('pointerenter', stop);
    cf.addEventListener('focusin', stop);
    cf.addEventListener('pointerleave', play);
    cf.addEventListener('focusout', play);

    return () => {
      stop();
      cf.removeEventListener('pointerenter', stop);
      cf.removeEventListener('focusin', stop);
      cf.removeEventListener('pointerleave', play);
      cf.removeEventListener('focusout', play);
    };
  }, [next]);

  // Touch Swipe
  useEffect(() => {
    const cf = carouselRef.current;
    if (!cf) return;
    let sx = 0,
      sy = 0,
      swiping = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      swiping = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!swiping) return;
      swiping = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    };

    cf.addEventListener('touchstart', onTouchStart, { passive: true });
    cf.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      cf.removeEventListener('touchstart', onTouchStart);
      cf.removeEventListener('touchend', onTouchEnd);
    };
  }, [next, prev]);

  // 3D Pointer tilt on active card
  useEffect(() => {
    if (isTouch() || motionOff()) return;
    const px = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const handlePointerMove = (e: PointerEvent) => {
      px.x = e.clientX;
      px.y = e.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const acc = { x: 0, y: 0 };
    let armed: HTMLElement | null = null;

    const tick = (dt: number) => {
      const activeBtn = document.querySelector('.cf-card.is-active .cf-inner') as HTMLElement | null;
      if (!activeBtn) {
        if (armed) armed.classList.remove('is-tilt');
        armed = null;
        acc.x = 0;
        acc.y = 0;
        return;
      }
      const r = activeBtn.getBoundingClientRect();
      if (!r.width) return;
      const dx = clampNum((px.x - (r.left + r.width / 2)) / 520, -1, 1);
      const dy = clampNum((px.y - (r.top + r.height / 2)) / 520, -1, 1);
      acc.x = lerp(acc.x, -dy * 7, Math.min(dt * 14, 0.35));
      acc.y = lerp(acc.y, dx * 9, Math.min(dt * 14, 0.35));
      activeBtn.style.setProperty('--tx', `${acc.x.toFixed(2)}deg`);
      activeBtn.style.setProperty('--ty', `${acc.y.toFixed(2)}deg`);
      activeBtn.classList.add('is-tilt');
      if (armed && armed !== activeBtn) armed.classList.remove('is-tilt');
      armed = activeBtn;
    };

    TICKER.add(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      TICKER.remove(tick);
      if (armed) armed.classList.remove('is-tilt');
    };
  }, []);

  return (
    <div className="cf" id="carousel" ref={carouselRef} data-cf>
      <div
        className="cf-viewport"
        ref={viewportRef}
        tabIndex={0}
        role="group"
        aria-label="Project carousel. Use the left and right arrow keys to browse."
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            next();
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prev();
          }
        }}
      >
        <ul className="cf-track" id="cfTrack">
          {CARDS.map((card, i) => {
            const isCardFlipped = !!flipped[i];
            return (
              <li
                key={i}
                className={`cf-card${isCardFlipped ? ' is-flipped' : ''}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <button
                  className="cf-inner"
                  type="button"
                  aria-expanded={isCardFlipped}
                  onClick={() => toggleFlip(i)}
                >
                  <span className="cf-art">{card.art}</span>
                  <span className="cf-face">
                    <span className="cf-title">{card.title}</span>
                    <span className="cf-desc">{card.desc}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="cf-controls">
        <button className="cf-btn" id="cfPrev" type="button" aria-label="Previous project" onClick={prev}>
          &lsaquo;
        </button>
        <ol className="cf-dots" id="cfDots" aria-label="Choose a project">
          {CARDS.map((card, i) => (
            <li key={i}>
              <button
                type="button"
                className={`cf-dot${i === active ? ' is-active' : ''}`}
                aria-label={`Show project ${i + 1}: ${card.title}`}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
        <button className="cf-btn" id="cfNext" type="button" aria-label="Next project" onClick={next}>
          &rsaquo;
        </button>
      </div>
    </div>
  );
}
