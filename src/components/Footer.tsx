'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CONFIG, mailLink, waLink, safeUrl } from '@/lib/config';
import { useModal } from '@/components/Modals';
import { goToSection, prefersReducedMotion } from '@/lib/ticker';

export default function Footer() {
  const { openModal } = useModal();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [year, setYear] = useState('2026');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem('seedai_reduce_motion');
    } catch {}

    const on = stored === null ? prefersReducedMotion() : stored === '1';
    setReducedMotion(on);
    document.documentElement.classList.toggle('reduce-motion', on);
  }, []);

  const handleToggleMotion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const on = e.target.checked;
    setReducedMotion(on);
    document.documentElement.classList.toggle('reduce-motion', on);
    try {
      window.localStorage.setItem('seedai_reduce_motion', on ? '1' : '0');
    } catch {}
    if (typeof (window as any).Scene3D?.reduced === 'function') {
      (window as any).Scene3D.reduced();
    }
  };

  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push(`/#${sectionId}`);
      setTimeout(() => {
        goToSection(sectionId);
      }, 150);
    } else {
      goToSection(sectionId);
    }
  };

  const emailHref = mailLink('Seed AI Academy');
  const waHref = waLink('Hi Seed AI Academy, I would like to know more about your courses.');
  const igUrl = safeUrl(CONFIG.INSTAGRAM_URL);
  const ytUrl = safeUrl(CONFIG.YOUTUBE_URL);
  const liUrl = safeUrl(CONFIG.LINKEDIN_URL);

  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand" aria-label="Seed AI Academy, home">
            <svg className="brand-mark" viewBox="0 0 200 200" aria-hidden="true">
              <use href="#seedai-mark" />
            </svg>
            <span className="brand-words">
              <span className="brand-name">
                <span className="w-seed">Seed</span>
                <span className="w-ai">AI</span>
              </span>
              <span className="brand-sub">Academy</span>
            </span>
          </Link>
          <p className="footer-desc">
            An online and in-person learning company teaching coding and AI to children (age 6+), teenagers and adults.
          </p>
          <p className="footer-tag">Learn AI. Build with AI. Grow with AI.</p>
        </div>

        <nav className="footer-col" aria-label="Quick links">
          <h3>Explore</h3>
          <ul className="footer-links">
            <li>
              <a href="#courses" onClick={(e) => handleNavClick('courses', e)}>
                Courses
              </a>
            </li>
            <li>
              <a href="#how" onClick={(e) => handleNavClick('how', e)}>
                How it works
              </a>
            </li>
            <li>
              <a href="#parents" onClick={(e) => handleNavClick('parents', e)}>
                For parents
              </a>
            </li>
            <li>
              <a href="#workshop" onClick={(e) => handleNavClick('workshop', e)}>
                Free workshop
              </a>
            </li>
            <li>
              <a href="#faq" onClick={(e) => handleNavClick('faq', e)}>
                FAQ
              </a>
            </li>
          </ul>
        </nav>

        <div className="footer-col">
          <h3>Get started</h3>
          <ul className="footer-links">
            <li>
              <Link href="/register">Register</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <a href="#results" onClick={(e) => handleNavClick('results', e)}>
                Our goals
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Contact</h3>
          <ul className="footer-links">
            <li>
              {emailHref ? (
                <a id="footerEmail" href={emailHref}>
                  {CONFIG.SEEDAI_EMAIL}
                </a>
              ) : (
                <a
                  id="footerEmail"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal('email');
                  }}
                >
                  Email us
                </a>
              )}
            </li>
            <li>
              {waHref ? (
                <a id="footerWhatsapp" href={waHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              ) : (
                <a
                  id="footerWhatsapp"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal('whatsapp');
                  }}
                >
                  WhatsApp (number pending)
                </a>
              )}
            </li>
          </ul>

          <h3 className="footer-sub">Follow Seed AI</h3>
          <ul className="footer-links footer-social">
            <li>
              {igUrl ? (
                <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram for Seed AI Academy">
                  Instagram
                </a>
              ) : (
                <span className="social-ph" aria-label="Instagram link coming soon">
                  Instagram · coming soon
                </span>
              )}
            </li>
            <li>
              {ytUrl ? (
                <a href={ytUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube for Seed AI Academy">
                  YouTube
                </a>
              ) : (
                <span className="social-ph" aria-label="YouTube link coming soon">
                  YouTube · coming soon
                </span>
              )}
            </li>
            <li>
              {liUrl ? (
                <a href={liUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn for Seed AI Academy">
                  LinkedIn
                </a>
              ) : (
                <span className="social-ph" aria-label="LinkedIn link coming soon">
                  LinkedIn · coming soon
                </span>
              )}
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Preferences</h3>
          <label className="toggle" htmlFor="reduceToggle">
            <input
              type="checkbox"
              id="reduceToggle"
              checked={reducedMotion}
              onChange={handleToggleMotion}
            />
            <span className="toggle-track" aria-hidden="true">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-text">Reduce motion</span>
          </label>
          <p className="footer-note">Follows your system setting by default.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; <span id="year">{year}</span> Seed AI Academy. All rights reserved.</p>
        <ul className="footer-legal">
          <li>
            <button type="button" onClick={() => openModal('privacy')}>
              Privacy
            </button>
          </li>
          <li>
            <button type="button" onClick={() => openModal('terms')}>
              Terms
            </button>
          </li>
        </ul>
      </div>
    </footer>
  );
}
