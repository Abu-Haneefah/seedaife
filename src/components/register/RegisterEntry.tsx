'use client';

import React, { useState } from 'react';

export type RegistrationFlow = 'parent' | 'teen' | 'adult' | 'guest';

interface RegisterEntryProps {
  onSelectFlow: (flow: RegistrationFlow) => void;
}

const CARDS = [
  {
    flow: 'parent' as RegistrationFlow,
    title: 'Parent & Child',
    ageTag: 'Ages 6 to 12',
    desc: 'Register as a parent, then hand the device over to let your child build their custom AI Hero Card & secret PIN!',
    badge: 'Kids Under 13',
    icon: '🌱',
    comment: "Awesome! Kids build real games & custom AI heroes here.",
    accent: '#B8F23C',
  },
  {
    flow: 'teen' as RegistrationFlow,
    title: 'Teen Builder',
    ageTag: 'Ages 13 to 17',
    desc: 'Direct account with parent consent. Vibe-code websites, React games, and real generative AI agents for your portfolio.',
    badge: 'Teens 13–17',
    icon: '⚡',
    comment: "Ready to vibe-code websites and AI agents? Let's go!",
    accent: '#A98BFF',
  },
  {
    flow: 'adult' as RegistrationFlow,
    title: 'Adult & Professional',
    ageTag: '18+ & Career Changers',
    desc: 'Upskilling tracks for accountants, educators, and creators. Automate spreadsheets, documents, and business workflows.',
    badge: 'Professionals',
    icon: '💼',
    comment: "Level up your workflow with generative AI and app building.",
    accent: '#FF6F61',
  },
  {
    flow: 'guest' as RegistrationFlow,
    title: 'Just Exploring',
    ageTag: 'Free Preview',
    desc: 'Explore published course curriculums, lesson previews, interactive demos, and free workshop replays.',
    badge: 'Guest Access',
    icon: '🧭',
    comment: "Take a tour of our courses, ladder, and interactive demos!",
    accent: '#FFF8E7',
  },
];

export default function RegisterEntry({ onSelectFlow }: RegisterEntryProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const activeComment =
    hoveredCard !== null
      ? CARDS[hoveredCard].comment
      : "Welcome! Who is joining Seed AI Academy today? Pick a card to begin.";

  return (
    <div className="reg-entry-wrap">
      {/* Interactive Seedbot Commentary */}
      <div className="reg-entry-guide reveal is-in">
        <div className="reg-bot-bubble">
          <p>{activeComment}</p>
        </div>
        <svg className="reg-bot-avatar" viewBox="0 0 200 200" aria-hidden="true">
          <use href="#seedai-mark" />
        </svg>
      </div>

      <header className="reg-entry-head reveal is-in">
        <p className="eyebrow">Start Your Mission</p>
        <h1>Who is joining Seed AI Academy?</h1>
        <p className="sec-lead">
          Choose how you will be learning with us today. Each journey has an experience tailored to your age and goals.
        </p>
      </header>

      {/* 4 Large 3D-Tilt Cards */}
      <div className="reg-cards-grid">
        {CARDS.map((card, idx) => (
          <button
            key={card.flow}
            type="button"
            className="reg-choice-card reveal is-in"
            style={{
              '--card-accent': card.accent,
            } as React.CSSProperties}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard(idx)}
            onBlur={() => setHoveredCard(null)}
            onClick={() => onSelectFlow(card.flow)}
          >
            <div className="rcc-top">
              <span className="rcc-icon" aria-hidden="true">{card.icon}</span>
              <span className="rcc-badge" style={{ borderColor: card.accent, color: card.accent }}>
                {card.badge}
              </span>
            </div>

            <h2 className="rcc-title">{card.title}</h2>
            <span className="rcc-age">{card.ageTag}</span>
            <p className="rcc-desc">{card.desc}</p>

            <div className="rcc-cta">
              <span className="rcc-arrow" style={{ color: card.accent }}>
                Select Track →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
