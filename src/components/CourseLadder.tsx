'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LevelDetail {
  badge: string;
  title: string;
  sub: string;
  weeks: string;
  prereq: string;
  ages: string;
  project: string;
  topics: string[];
}

const LADDER_LEVELS: Record<string, LevelDetail> = {
  '101': {
    badge: '101',
    title: 'Generative AI 101',
    sub: 'Introduction to AI and core concepts',
    weeks: 'About 6 weeks',
    prereq: 'None',
    ages: 'Ages 11+ (and up)',
    project: 'A short AI-assisted video or story, plus a personal prompt playbook.',
    topics: [
      'What AI is and is not',
      'AI vs machine learning vs generative AI',
      'How language models work in plain terms',
      'Prompting basics',
      'Image, audio and video generation',
      'Creating videos with AI tools',
      'Hallucinations, bias, copyright and privacy',
      'Responsible use',
    ],
  },
  '102': {
    badge: '102',
    title: 'Generative AI 102',
    sub: 'AI tools for building',
    weeks: 'About 8 weeks',
    prereq: '101 or placement test',
    ages: 'Ages 13+ (and up)',
    project: 'A live, published 3 to 4 page website.',
    topics: [
      'Build a landing page with AI',
      'Build a multi-step 3 to 4 page website',
      'Design generation: layouts, colour and brand kit',
      'AI-written site copy',
      'Forms and navigation',
      'Responsive checks',
      'Fixing AI output',
      'Publishing the site',
    ],
  },
  '103': {
    badge: '103',
    title: 'Generative AI 103',
    sub: 'AI agents and vibe coding',
    weeks: '10 to 12 weeks',
    prereq: '102',
    ages: 'Ages 14+ (and up)',
    project: 'A deployed app with a database, plus one automated agent workflow for your role.',
    topics: [
      'Vibe-code a full working app and website',
      'A database, accounts and deployment',
      'Plan and specify work for AI agents',
      'Automate workflows',
      'Connect AI to Google Calendar, Docs, Sheets and email',
      'Testing, debugging and security basics',
      'Role tracks: accountant, content creator, educator',
    ],
  },
};

export default function CourseLadder({ externalLevel }: { externalLevel?: string | null }) {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  useEffect(() => {
    if (externalLevel && LADDER_LEVELS[externalLevel]) {
      setActiveLevel(externalLevel);
    }
  }, [externalLevel]);

  const toggleLevel = (level: string) => {
    setActiveLevel((prev) => (prev === level ? null : level));
  };

  const levelData = activeLevel ? LADDER_LEVELS[activeLevel] : null;

  return (
    <section className="section section-dark" id="courses">
      <div className="section-inner">
        <header className="sec-head reveal">
          <p className="eyebrow">The course ladder</p>
          <h2>Three steps from using AI to building with it.</h2>
          <p className="sec-lead">
            Start at the bottom step and climb. Choose a step to see what you cover and what you finish with.
          </p>
        </header>

        <div className="ladder">
          <ol className="ladder-steps" aria-label="Generative AI course ladder">
            {(['101', '102', '103'] as const).map((lvl) => {
              const isOpen = activeLevel === lvl;
              const ages = lvl === '101' ? 'Ages 11+' : lvl === '102' ? 'Ages 13+' : 'Ages 14+';
              return (
                <li key={lvl} className={`lstep${isOpen ? ' is-open' : ''}`} data-level={lvl}>
                  <button
                    type="button"
                    className="lstep-btn"
                    aria-expanded={isOpen}
                    aria-controls="coursePanel"
                    onClick={() => toggleLevel(lvl)}
                  >
                    <span className="lstep-num">{lvl}</span>
                    <span className="lstep-name">Generative AI {lvl}</span>
                    <span className="lstep-chip">{ages}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {levelData && (
            <div
              className={`ladder-panel acc-${activeLevel}`}
              id="coursePanel"
              role="region"
              aria-label="Course details"
              tabIndex={-1}
            >
              <div className="lp-head">
                <span className="lp-badge" id="lpBadge">
                  {levelData.badge}
                </span>
                <div className="lp-heading">
                  <h3 id="lpTitle">{levelData.title}</h3>
                  <p className="lp-sub" id="lpSub">
                    {levelData.sub}
                  </p>
                </div>
                <button
                  className="lp-close"
                  id="lpClose"
                  type="button"
                  aria-label="Close course details"
                  onClick={() => setActiveLevel(null)}
                >
                  &times;
                </button>
              </div>
              <dl className="lp-meta">
                <div>
                  <dt>Length</dt>
                  <dd id="lpWeeks">{levelData.weeks}</dd>
                </div>
                <div>
                  <dt>Prerequisite</dt>
                  <dd id="lpPrereq">{levelData.prereq}</dd>
                </div>
                <div>
                  <dt>Ages</dt>
                  <dd id="lpAges">{levelData.ages}</dd>
                </div>
              </dl>
              <div className="lp-cols">
                <div className="lp-col">
                  <h4>What you cover</h4>
                  <ul className="lp-topics" id="lpTopics">
                    {levelData.topics.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="lp-col">
                  <h4>Final project</h4>
                  <p className="lp-project" id="lpProject">
                    {levelData.project}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ladder-cta reveal">
          <Link className="btn btn-lime btn-lg" href="/register">
            Start with 101
          </Link>
          <p className="micro">New to AI? 101 assumes no experience at all.</p>
        </div>
      </div>
    </section>
  );
}
