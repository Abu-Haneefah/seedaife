'use client';

import React, { useState } from 'react';

const LEARNERS = [
  {
    id: 0,
    tabLabel: 'Ages 6 to 9',
    cubeFace: '6–9',
    label: 'Visual, playful, supervised',
    learn: 'Block coding in Scratch, sequences, loops and events, and how to give an AI a clear instruction with a grown-up beside them.',
    outcome: 'An animated story or mini game they built themselves, and a first habit of careful, supervised AI use.',
  },
  {
    id: 1,
    tabLabel: 'Ages 10 to 13',
    cubeFace: '10–13',
    label: 'Creative projects',
    learn: 'Scratch plus the first steps into HTML and CSS, how language models answer prompts, and how to make images and short videos with AI.',
    outcome: 'A creative project: an animated game and an AI-assisted video they can show to family and friends.',
  },
  {
    id: 2,
    tabLabel: 'Ages 14 to 18',
    cubeFace: '14–18',
    label: 'Portfolio and real skills',
    learn: 'JavaScript and React Fundamentals alongside Generative AI 101 and 102: prompting, designing, building and fixing real pages.',
    outcome: 'A published website and a portfolio that proves real, usable skills for school, internships and first jobs.',
  },
  {
    id: 3,
    tabLabel: 'Adults and career changers',
    cubeFace: 'Adults',
    label: 'From using AI to building with it',
    learn: 'Prompting that actually works, then Generative AI 102 and 103: websites, databases, deployment, agents and automation.',
    outcome: 'A deployed app with a database and one automated workflow you built and can maintain yourself.',
  },
  {
    id: 4,
    tabLabel: 'Professionals',
    cubeFace: 'Pros',
    label: 'Role tracks: accountant, content creator, educator',
    learn: 'Generative AI 103 on a role track, connecting AI to the tools you already use: Google Calendar, Docs, Sheets and email.',
    outcome: 'An AI agent workflow that does a real piece of your job, plus the judgement to know when to trust it.',
  },
];

export default function WhoTabs() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="section section-dark" id="who">
      <div className="section-inner">
        <header className="sec-head reveal">
          <p className="eyebrow">Who it is for</p>
          <h2>Everyone starts somewhere.</h2>
          <p className="sec-lead">
            Pick a learner and the cube turns to show what they learn and what they take away.
          </p>
        </header>

        <div className="who">
          <div className="cube-stage" aria-hidden="true">
            <div className={`cube cube--${activeTab}`} id="whoCube">
              <div className="cube-face cf-1">
                <span>6&ndash;9</span>
              </div>
              <div className="cube-face cf-2">
                <span>10&ndash;13</span>
              </div>
              <div className="cube-face cf-3">
                <span>14&ndash;18</span>
              </div>
              <div className="cube-face cf-4">
                <span>Adults</span>
              </div>
              <div className="cube-face cf-5">
                <span>Pros</span>
              </div>
            </div>
          </div>

          <div className="who-main">
            <div className="who-tabs" role="tablist" aria-label="Choose a learner">
              {LEARNERS.map((item, idx) => (
                <button
                  key={item.id}
                  className={`who-tab${activeTab === idx ? ' is-active' : ''}`}
                  id={`wtab-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === idx}
                  aria-controls={`wpanel-${idx}`}
                  tabIndex={activeTab === idx ? 0 : -1}
                  onClick={() => setActiveTab(idx)}
                >
                  {item.tabLabel}
                </button>
              ))}
            </div>

            <div className="who-panels">
              {LEARNERS.map((item, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div
                    key={item.id}
                    className={`who-panel${isActive ? ' is-active' : ''}`}
                    id={`wpanel-${idx}`}
                    role="tabpanel"
                    aria-labelledby={`wtab-${idx}`}
                    tabIndex={0}
                    hidden={!isActive}
                  >
                    <p className="who-label">{item.label}</p>
                    <div className="who-cols">
                      <div className="who-col">
                        <h4>What they learn</h4>
                        <p>{item.learn}</p>
                      </div>
                      <div className="who-col">
                        <h4>What they walk away with</h4>
                        <p>{item.outcome}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
