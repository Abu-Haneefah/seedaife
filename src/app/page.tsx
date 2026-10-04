'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SeedbotScene from '@/components/SeedbotScene';
import ProjectCarousel from '@/components/ProjectCarousel';
import CourseLadder from '@/components/CourseLadder';
import WhoTabs from '@/components/WhoTabs';
import SeedbotChat from '@/components/SeedbotChat';
import WorkshopForm from '@/components/WorkshopForm';
import FaqAccordion from '@/components/FaqAccordion';
import { motionOff, clampNum, goToSection } from '@/lib/ticker';

export default function HomePage() {
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string | null>(null);

  // Reveals, Counters, and How Path Line animation
  useEffect(() => {
    // 1. Reveal animations
    const revealEls = document.querySelectorAll('.reveal');
    if (motionOff()) {
      revealEls.forEach((el) => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('is-in');
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.06 }
      );
      revealEls.forEach((el) => io.observe(el));
      setTimeout(() => {
        revealEls.forEach((el) => el.classList.add('is-in'));
      }, 5000);
    }

    // 2. Animated Counters
    const counterEls = document.querySelectorAll('.counter-num');
    const runCounter = (el: Element) => {
      const target = parseFloat(el.getAttribute('data-count') || '0');
      const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if (motionOff()) {
        el.textContent = target.toFixed(dec) + suffix;
        return;
      }
      const dur = 1500;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = clampNum((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            runCounter(en.target);
            counterIO.unobserve(en.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    counterEls.forEach((n) => counterIO.observe(n));

    // 3. How Path Line Drawing
    const line = document.getElementById('howPathLine');
    const howHost = document.querySelector('.how');
    if (line && howHost) {
      const draw = () => line.classList.add('is-drawn');
      if (motionOff()) {
        draw();
      } else {
        const lineIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (en.isIntersecting) {
                draw();
                lineIO.disconnect();
              }
            });
          },
          { threshold: 0.2 }
        );
        lineIO.observe(howHost);
        setTimeout(draw, 4500);
      }
    }
  }, []);

  return (
    <>
      {/* 3D SCENE LAYER: fixed behind content */}
      <SeedbotScene onOpenCourseLevel={(level) => setSelectedCourseLevel(level)} />

      {/* VIEW: LANDING */}
      <div className="view is-active" data-view="landing">
        {/* HERO WITH 3D SCENE */}
        <section className="hero" id="top" data-scene="hero">
          <div className="section-inner hero-inner">
            <div className="hero-copy">
              <p className="pill">
                <span className="pill-dot" aria-hidden="true" />
                Coding and AI for ages 6 to adults
              </p>
              <h1>
                Learn AI. Build with AI. <span className="hl">Grow with AI.</span>
              </h1>
              <p className="hero-sub">
                Project-based courses where kids, teens and professionals go from using AI to building with it.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-lime btn-lg" href="/register">
                  Start learning
                </Link>
                <button
                  className="btn btn-ghost btn-lg"
                  type="button"
                  onClick={() => goToSection('build')}
                >
                  Explore courses
                </button>
              </div>
              <ul className="trust-chips">
                <li>Live and self-paced</li>
                <li>Safe for kids</li>
                <li>Built for all ages</li>
              </ul>
            </div>
          </div>
          <button
            className="scroll-cue"
            type="button"
            aria-label="Scroll to see what you will build"
            onClick={() => goToSection('build')}
          >
            <span className="cue-line" aria-hidden="true" />
            <span className="cue-text">Scroll</span>
          </button>
        </section>

        {/* WHAT YOU WILL BUILD (3D coverflow carousel) */}
        <section className="section section-dark" id="build">
          <div className="section-inner">
            <header className="sec-head reveal">
              <p className="eyebrow">What you will build</p>
              <h2>Real projects, not slide decks.</h2>
              <p className="sec-lead">
                Every course ends with something you can show. Tap a card to flip it, then swipe or use the arrow
                keys to move through the projects.
              </p>
            </header>
            <ProjectCarousel />
          </div>
        </section>

        {/* THE COURSE LADDER */}
        <CourseLadder externalLevel={selectedCourseLevel} />

        {/* CODING FOUNDATIONS */}
        <section className="section section-light on-light" id="foundations">
          <div className="section-inner">
            <header className="sec-head reveal">
              <p className="eyebrow">Coding foundations</p>
              <h2>Where every builder starts.</h2>
              <p className="sec-lead">
                Four tracks that turn curiosity into code. Hover, tap or focus a tile to see the project it ends with.
              </p>
            </header>
            <ul className="tiles">
              <li className="tile reveal">
                <article className="tile-card" tabIndex={0}>
                  <p className="tile-age">Ages 6 to 12</p>
                  <h3 className="tile-name">Scratch for Kids</h3>
                  <p className="tile-project">
                    <span>Final project</span>An animated story and game
                  </p>
                </article>
              </li>
              <li className="tile reveal">
                <article className="tile-card" tabIndex={0}>
                  <p className="tile-age">Ages 11+</p>
                  <h3 className="tile-name">Web Foundations: HTML and CSS</h3>
                  <p className="tile-project">
                    <span>Final project</span>A portfolio page
                  </p>
                </article>
              </li>
              <li className="tile reveal">
                <article className="tile-card" tabIndex={0}>
                  <p className="tile-age">Ages 13+</p>
                  <h3 className="tile-name">JavaScript Essentials</h3>
                  <p className="tile-project">
                    <span>Final project</span>A to-do app and a browser game
                  </p>
                </article>
              </li>
              <li className="tile reveal">
                <article className="tile-card" tabIndex={0}>
                  <p className="tile-age">Ages 14+</p>
                  <h3 className="tile-name">React Fundamentals</h3>
                  <p className="tile-project">
                    <span>Final project</span>A multi-view app
                  </p>
                </article>
              </li>
            </ul>
          </div>
        </section>

        {/* WHO IT IS FOR */}
        <WhoTabs />

        {/* FOR PARENTS */}
        <section className="section section-light on-light" id="parents">
          <div className="section-inner">
            <header className="sec-head reveal">
              <p className="eyebrow">For parents</p>
              <h2>See what your child can create, and stay in the loop.</h2>
            </header>

            <div className="parents">
              <div className="shield-wrap reveal">
                <svg className="shield-svg" viewBox="0 0 120 140" aria-hidden="true">
                  <path d="M60 6 L112 26 V70 C112 104 88 128 60 136 C32 128 8 104 8 70 V26 Z" fill="#2A1450" />
                  <path d="M60 20 L99 35 V70 C99 97 81 116 60 123 C39 116 21 97 21 70 V35 Z" fill="#B8F23C" />
                  <path
                    d="M42 72 L55 86 L82 54"
                    stroke="#2A1450"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <ul className="parent-points reveal">
                <li>Supervised AI use for children, with age-appropriate tools and prompts.</li>
                <li>No advertising to children, ever. No ads on their screens.</li>
                <li>Parent-controlled profiles: under 13s learn under your account with a PIN, never their own login.</li>
                <li>
                  Class notifications and progress live in the parent dashboard, so there is no WhatsApp group to chase.
                </li>
                <li>A project showcase, so you can see what your child built, not just what they were taught.</li>
              </ul>

              <div
                className="mock-dash reveal"
                role="img"
                aria-label="Example of the parent dashboard: an upcoming class notification, an assignment status and a message from the instructor"
              >
                <div className="mock-head">
                  <span className="mock-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="mock-title">Parent dashboard</span>
                  <span className="mock-tag">Example</span>
                </div>
                <div className="mock-body">
                  <div className="mock-row">
                    <span className="mock-ico ico-lime" aria-hidden="true">
                      &#33;
                    </span>
                    <div className="mock-text">
                      <strong>Upcoming class</strong>
                      <span>Generative AI 101 starts today at 4:00 PM</span>
                    </div>
                  </div>
                  <div className="mock-row">
                    <span className="mock-ico ico-lilac" aria-hidden="true">
                      &#10003;
                    </span>
                    <div className="mock-text">
                      <strong>Assignment status</strong>
                      <span>Prompt playbook &mdash; submitted, waiting for grading</span>
                    </div>
                  </div>
                  <div className="mock-row">
                    <span className="mock-ico ico-plum" aria-hidden="true">
                      &#9993;
                    </span>
                    <div className="mock-text">
                      <strong>Message from the instructor</strong>
                      <span>&ldquo;Great progress this week &mdash; the story idea is strong.&rdquo;</span>
                    </div>
                  </div>
                </div>
                <p className="mock-note">
                  Example layout with sample data. Real information appears in your dashboard after registration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section section-dark" id="how">
          <div className="section-inner">
            <header className="sec-head reveal">
              <p className="eyebrow">How it works</p>
              <h2>Four steps from curious to capable.</h2>
            </header>

            <div className="how">
              <svg
                className="how-path"
                viewBox="0 0 900 130"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  className="how-path-base"
                  d="M48 92 C160 22 250 22 350 66 C450 110 540 110 640 66 C730 26 810 30 866 70"
                  fill="none"
                  stroke="rgba(255,248,231,.18)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  className="how-path-line"
                  id="howPathLine"
                  d="M48 92 C160 22 250 22 350 66 C450 110 540 110 640 66 C730 26 810 30 866 70"
                  fill="none"
                  stroke="#B8F23C"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

              <ol className="how-steps">
                <li className="how-step reveal">
                  <span className="how-ico" aria-hidden="true">
                    <svg viewBox="0 0 48 48">
                      <circle cx="24" cy="18" r="9" fill="none" stroke="#2A1450" strokeWidth="4" />
                      <path
                        d="M8 42c2-9 8-13 16-13s14 4 16 13"
                        fill="none"
                        stroke="#2A1450"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="how-num">Step 1</span>
                  <h3>Create your account</h3>
                  <p>Parent, teen or adult. A couple of minutes, and a parent account is all a 6 year old needs.</p>
                </li>
                <li className="how-step reveal">
                  <span className="how-ico" aria-hidden="true">
                    <svg viewBox="0 0 48 48">
                      <path d="M6 22h20v22H6z" fill="#2A1450" />
                      <path d="M26 12h16v32H26z" fill="#2A1450" opacity=".6" />
                      <path
                        d="M14 32l9-9 9 9"
                        fill="none"
                        stroke="#B8F23C"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="how-num">Step 2</span>
                  <h3>Pick a course</h3>
                  <p>Start with Generative AI 101 or a coding foundation track, and see the full ladder ahead of you.</p>
                </li>
                <li className="how-step reveal">
                  <span className="how-ico" aria-hidden="true">
                    <svg viewBox="0 0 48 48">
                      <rect x="8" y="10" width="32" height="24" rx="6" fill="#2A1450" />
                      <rect x="16" y="36" width="16" height="4" rx="2" fill="#2A1450" />
                      <circle cx="24" cy="22" r="5" fill="#B8F23C" />
                    </svg>
                  </span>
                  <span className="how-num">Step 3</span>
                  <h3>Join live classes from your dashboard</h3>
                  <p>Your class link, reminders and materials arrive in the dashboard. Parents get the same notification.</p>
                </li>
                <li className="how-step reveal">
                  <span className="how-ico" aria-hidden="true">
                    <svg viewBox="0 0 48 48">
                      <path
                        d="M24 6l5 11 12 1.5-9 8 2.5 12L24 33l-10.5 5.5L16 26.5l-9-8L19 17z"
                        fill="#2A1450"
                      />
                      <circle cx="24" cy="24" r="4" fill="#B8F23C" />
                    </svg>
                  </span>
                  <span className="how-num">Step 4</span>
                  <h3>Build and showcase your project</h3>
                  <p>Finish with something real, then it goes on your showcase for family, classmates and your portfolio.</p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* TALK TO SEEDBOT */}
        <SeedbotChat />

        {/* FORMATS */}
        <section className="section section-light on-light" id="formats">
          <div className="section-inner">
            <header className="sec-head reveal">
              <p className="eyebrow">Formats</p>
              <h2>Learn the way that fits your week.</h2>
            </header>
            <ul className="formats">
              <li className="glass-card reveal">
                <h3>Live virtual classes</h3>
                <p>Small groups with real instructors, joined from your dashboard with a reminder before every session.</p>
              </li>
              <li className="glass-card reveal">
                <h3>Self-paced</h3>
                <p>Work through the same projects on your own schedule, with recordings and materials to hand.</p>
              </li>
              <li className="glass-card reveal">
                <h3>In-person classes and camps</h3>
                <p>Hands-on sessions and holiday camps where learners build side by side.</p>
              </li>
              <li className="glass-card reveal">
                <h3>School and group programs</h3>
                <p>We bring coding and AI to your school or organisation, sized to your group.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* RESULTS / TARGETS */}
        <section className="section section-dark" id="results">
          <div className="section-inner">
            <header className="sec-head reveal">
              <p className="eyebrow">Our goals for year one</p>
              <h2>Aiming high, and honest about it.</h2>
              <p className="sec-lead">
                These are targets we have set ourselves for the first year of Seed AI Academy, not results we claim to
                have. Real numbers will be published after the pilot.
              </p>
            </header>

            <ul className="counters">
              <li className="counter reveal">
                <span className="counter-num" data-count="70" data-suffix="%">
                  0%
                </span>
                <span className="counter-label">Course completion</span>
              </li>
              <li className="counter reveal">
                <span className="counter-num" data-count="90" data-suffix="%">
                  0%
                </span>
                <span className="counter-label">Learners who finish their portfolio project</span>
              </li>
              <li className="counter reveal">
                <span className="counter-num" data-count="4.5" data-decimals="1" data-suffix="/5">
                  0/5
                </span>
                <span className="counter-label">Satisfaction rating from parents</span>
              </li>
            </ul>

            <ul className="quotes">
              <li className="quote reveal">
                <p className="quote-body">Replace with real feedback after the pilot.</p>
                <p className="quote-meta">Placeholder testimonial</p>
              </li>
              <li className="quote reveal">
                <p className="quote-body">Replace with real feedback after the pilot.</p>
                <p className="quote-meta">Placeholder testimonial</p>
              </li>
            </ul>
            <p className="micro center">Testimonial cards are deliberately empty until we have real, permissioned feedback.</p>
          </div>
        </section>

        {/* FREE WORKSHOP FORM */}
        <WorkshopForm />

        {/* FAQ ACCORDION */}
        <FaqAccordion />

        {/* FINAL CTA */}
        <section className="section final-cta" id="cta">
          <div className="section-inner">
            <div className="cta-card reveal">
              <div className="cta-copy">
                <h2>Ready to plant the seed?</h2>
                <p>Create an account, join a free workshop, and see what your child can build with AI.</p>
                <div className="cta-actions">
                  <Link className="btn btn-lime btn-lg" href="/register">
                    Create your account
                  </Link>
                  <button
                    className="btn btn-ghost btn-lg"
                    type="button"
                    onClick={() => goToSection('workshop')}
                  >
                    Join the free workshop
                  </button>
                </div>
              </div>
              <svg className="cta-bot" viewBox="0 0 200 220" aria-hidden="true">
                <use href="#seedai-mark" x="0" y="0" width="200" height="200" />
                <g className="cta-arm">
                  <rect x="152" y="114" width="24" height="48" rx="12" fill="#B8F23C" />
                </g>
              </svg>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
