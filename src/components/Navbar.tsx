'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { goToSection } from '@/lib/ticker';
import TimeModeSwitcher from '@/components/TimeModeSwitcher';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animatingOpen, setAnimatingOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 14);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMobileMenu = () => {
    setMenuOpen(true);
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      setAnimatingOpen(true);
    });
  };

  const closeMobileMenu = () => {
    setAnimatingOpen(false);
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      setMenuOpen(false);
    }, 380);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        closeMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    closeMobileMenu();
    if (pathname !== '/') {
      router.push(`/#${sectionId}`);
      setTimeout(() => {
        goToSection(sectionId);
      }, 150);
    } else {
      goToSection(sectionId);
    }
  };

  return (
    <>
      <header className={`navbar${scrolled ? ' is-scrolled' : ''}`} id="navbar">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="Seed AI Academy, home" onClick={closeMobileMenu}>
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

          <nav className="nav-links" aria-label="Primary">
            <a href="#courses" onClick={(e) => handleNavClick('courses', e)}>
              Courses
            </a>
            <a href="#how" onClick={(e) => handleNavClick('how', e)}>
              How it works
            </a>
            <a href="#parents" onClick={(e) => handleNavClick('parents', e)}>
              For parents
            </a>
            <a href="#workshop" onClick={(e) => handleNavClick('workshop', e)}>
              Free workshop
            </a>
            <a href="#faq" onClick={(e) => handleNavClick('faq', e)}>
              FAQ
            </a>
          </nav>

          <div className="nav-cta">
            <TimeModeSwitcher />
            <Link className="btn btn-ghost" href="/login">
              Login
            </Link>
            <Link className="btn btn-lime" href="/register">
              Register
            </Link>
          </div>

          <TimeModeSwitcher compact={true} className="nav-ts-mobile" />

          <button
            className="nav-toggle"
            id="navToggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            aria-label="Open menu"
            onClick={menuOpen ? closeMobileMenu : openMobileMenu}
          >
            <span className="bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className={`mobile-menu${animatingOpen ? ' is-open' : ''}`} id="mobileMenu">
          <div className="mm-top">
            <Link href="/" className="brand" aria-label="Seed AI Academy, home" onClick={closeMobileMenu}>
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
            <button className="mm-close" id="mmClose" type="button" aria-label="Close menu" onClick={closeMobileMenu}>
              &times;
            </button>
          </div>
          <nav className="mm-links" aria-label="Mobile">
            <a href="#courses" onClick={(e) => handleNavClick('courses', e)}>
              <span>01</span>Courses
            </a>
            <a href="#how" onClick={(e) => handleNavClick('how', e)}>
              <span>02</span>How it works
            </a>
            <a href="#parents" onClick={(e) => handleNavClick('parents', e)}>
              <span>03</span>For parents
            </a>
            <a href="#workshop" onClick={(e) => handleNavClick('workshop', e)}>
              <span>04</span>Free workshop
            </a>
            <a href="#faq" onClick={(e) => handleNavClick('faq', e)}>
              <span>05</span>FAQ
            </a>
          </nav>
          <div className="mm-ts-box" style={{ margin: '1rem 0 0.5rem' }}>
            <TimeModeSwitcher className="mm-ts" />
          </div>
          <div className="mm-cta">
            <Link className="btn btn-ghost" href="/login" onClick={closeMobileMenu}>
              Login
            </Link>
            <Link className="btn btn-lime" href="/register" onClick={closeMobileMenu}>
              Register
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
