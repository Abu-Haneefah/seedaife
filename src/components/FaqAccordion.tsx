'use client';

import React, { useState } from 'react';

const FAQS = [
  {
    id: 'faq-1',
    q: 'Who can join?',
    a: 'Everyone from age 6 upwards: children, teenagers, adults and working professionals. Children under 13 do not get their own login, they learn under a parent account with a PIN.',
  },
  {
    id: 'faq-2',
    q: 'Do kids need experience?',
    a: 'No. Scratch for Kids starts from the very beginning, and Generative AI 101 assumes no previous experience at all.',
  },
  {
    id: 'faq-3',
    q: 'Is AI safe for children?',
    a: 'AI use for children is supervised and age-appropriate. There is no advertising to children, profiles are controlled by the parent, and class notifications and progress go to the parent dashboard.',
  },
  {
    id: 'faq-4',
    q: 'Online or in person?',
    a: 'Both. Live virtual classes and self-paced tracks run online, and we also run in-person classes and camps plus school and group programs.',
  },
  {
    id: 'faq-5',
    q: 'How do classes work?',
    a: 'You join live classes from your dashboard. Learners and their parents get a notification before each class, and class materials stay in the dashboard afterwards.',
  },
  {
    id: 'faq-6',
    q: 'What do I need?',
    a: 'A computer or tablet with an internet connection. There is nothing to install before your first session.',
  },
  {
    id: 'faq-7',
    q: 'What happens after 101?',
    a: 'Generative AI 102 builds published websites with AI, and Generative AI 103 covers AI agents and vibe coding: a full app with a database and deployment, plus one automated workflow.',
  },
];

export default function FaqAccordion() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="section section-light on-light" id="faq">
      <div className="section-inner">
        <header className="sec-head reveal">
          <p className="eyebrow">FAQ</p>
          <h2>Questions parents ask first.</h2>
        </header>

        <ul className="faq">
          {FAQS.map((item) => {
            const isOpen = !!openMap[item.id];
            return (
              <li key={item.id} className={`acc reveal${isOpen ? ' is-open' : ''}`}>
                <h3 className="acc-h">
                  <button
                    className="acc-btn"
                    id={`${item.id}-btn`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={item.id}
                    onClick={() => toggle(item.id)}
                  >
                    <span>{item.q}</span>
                    <span className="acc-ico" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className="acc-panel"
                  id={item.id}
                  role="region"
                  aria-labelledby={`${item.id}-btn`}
                  hidden={!isOpen}
                >
                  <p>{item.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="micro">Pricing is announced at launch. Join the free workshop to get early access.</p>
      </div>
    </section>
  );
}
