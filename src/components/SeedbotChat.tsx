'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

const SEEDBOT_RULES = [
  {
    keys: ['dino', 'dinosaur', 'game', 'scratch', 'character'],
    reply:
      'A dinosaur game! Nice. We would start in Scratch: pick a hero, animate it frame by frame, then add a score and levels. Want it to roar when it wins?',
  },
  {
    keys: ['website', 'site', 'web', 'page', 'html', 'landing'],
    reply:
      'A website is a great first build. Plan the pages (home, about, contact), sketch one section, then let AI help with the words and the layout. In Generative AI 102 you publish it for real.',
  },
  {
    keys: ['agent', 'automat', 'workflow', 'email', 'sheet', 'calendar'],
    reply:
      'An agent that saves you hours, my favourite kind of project. We define one job, for example sorting email into folders, then connect the tools and test it until it just runs.',
  },
  {
    keys: ['robot', 'seedbot', 'you'],
    reply:
      'That is me. I am a small robot with a sprout antenna. Students build characters like me in the first project of the ladder.',
  },
  {
    keys: ['price', 'cost', 'fee', 'pay'],
    reply: 'Pricing is announced at launch. Join the free workshop and we will tell you first.',
  },
  {
    keys: ['kid', 'child', 'age', 'young', 'parent'],
    reply:
      'Children from 6 are welcome. Under 13 they learn under a parent account with a PIN, and parents see class reminders and progress in the parent dashboard.',
  },
  {
    keys: ['python', 'code', 'coding', 'javascript', 'react'],
    reply:
      'We start with visual block coding, then Web Foundations with HTML and CSS, then JavaScript and React. By the end you are shipping real apps.',
  },
];

const SEEDBOT_FALLBACK = [
  "Let's make it real. Tell me who it is for and what it should do, then we pick the simplest first step and build from there.",
  'Good idea. In a Seed AI class we would shrink that into one small first version, build it, then make it better together.',
  'I like it. Every project starts the same way here: one clear prompt, one small build, then we improve it step by step.',
];

function seedbotReply(prompt: string): string {
  const p = String(prompt || '').toLowerCase();
  for (let i = 0; i < SEEDBOT_RULES.length; i++) {
    const r = SEEDBOT_RULES[i];
    if (r.keys.some((k) => p.indexOf(k) > -1)) return r.reply;
  }
  return SEEDBOT_FALLBACK[Math.floor(Math.random() * SEEDBOT_FALLBACK.length)];
}

export default function SeedbotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'bot',
      text: 'Hi, I am Seedbot. Tell me what you want to build and I will show you how the project starts.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const askSeedbot = (promptText: string) => {
    const text = String(promptText || '').trim().slice(0, 140);
    if (!text) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    if (typeof (window as any).Scene3D?.api === 'function') {
      const api = (window as any).Scene3D.api();
      if (api?.sparkBurst) api.sparkBurst();
    }

    const reply = seedbotReply(text);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'bot',
          text: reply,
        },
      ]);
      if (typeof (window as any).Scene3D?.api === 'function') {
        const api = (window as any).Scene3D.api();
        if (api?.showBubble) api.showBubble("Let's build something!");
      }
    }, 720);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    askSeedbot(inputValue);
    setInputValue('');
  };

  return (
    <section className="section section-dark" id="seedbot">
      <div className="section-inner">
        <header className="sec-head reveal">
          <p className="eyebrow">Talk to Seedbot</p>
          <h2>Ask Seedbot for something.</h2>
          <p className="sec-lead">
            Type an idea and see how we start every project: a clear prompt, then the first small steps.
          </p>
        </header>

        <div className="chat reveal" id="chat">
          <div className="chat-head">
            <span className="chat-avatar" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <use href="#seedai-mark" />
              </svg>
            </span>
            <div className="chat-id">
              <strong>Seedbot</strong>
              <span className="chat-status">
                <i aria-hidden="true" />
                Scripted demo
              </span>
            </div>
          </div>

          <div
            className="chat-log"
            id="chatLog"
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with Seedbot"
          >
            {messages.map((m) => (
              <div key={m.id} className={`msg msg-${m.role}`}>
                <p>{m.text}</p>
              </div>
            ))}
            {typing && (
              <div className="msg msg-bot">
                <span className="msg-typing">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )}
          </div>

          <div className="chat-chips" id="chatChips">
            <button
              type="button"
              className="chip-btn"
              onClick={() => askSeedbot('make me a dinosaur game')}
            >
              Make me a dinosaur game
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => askSeedbot('build my own website')}
            >
              Build my own website
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => askSeedbot('an agent that sorts my email')}
            >
              An agent that sorts my email
            </button>
          </div>

          <form className="chat-form" id="chatForm" onSubmit={handleSubmit} noValidate>
            <label className="visually-hidden" htmlFor="chatInput">
              Your prompt for Seedbot
            </label>
            <input
              id="chatInput"
              name="prompt"
              type="text"
              placeholder="Type a prompt, like: make me a dinosaur game"
              autoComplete="off"
              maxLength={140}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="btn btn-lime" type="submit">
              Send
            </button>
          </form>

          <p className="chat-note">
            A tiny taste of what you will learn. Seedbot&apos;s replies here are pre-written, not a real AI.
          </p>
        </div>
      </div>
    </section>
  );
}
