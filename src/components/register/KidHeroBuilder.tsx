'use client';

import React, { useState, useEffect } from 'react';
import { getSupabase, setChildPin } from '@/lib/supabase';
import {
  isSoundEnabled,
  setSoundEnabled,
  playHeroSelect,
  playPowerColor,
  playPinKey,
  playFanfare,
} from '@/lib/sound';

export interface CreatedHero {
  id: string;
  name: string;
  heroKey: string;
  powerColor: string;
  ageBand: '6-9' | '10-13';
  interest: string;
}

interface KidHeroBuilderProps {
  parentId?: string;
  parentEmail?: string;
  onFinishAll?: (heroes: CreatedHero[]) => void;
}

const HEROES = [
  {
    key: 'captain-bolt',
    name: 'Captain Bolt',
    title: 'The Electric Coder',
    tagline: 'Supercharged with lightning logic!',
  },
  {
    key: 'pixel-pup',
    name: 'Pixel Pup',
    title: 'Arcade Game Builder',
    tagline: 'Sniffing out bugs, creating awesome games!',
  },
  {
    key: 'nova-fox',
    name: 'Nova Fox',
    title: 'Cosmic Explorer',
    tagline: 'Navigating galaxies of code & stars!',
  },
  {
    key: 'robo-sprout',
    name: 'Robo Sprout',
    title: 'Cyber Nature Bot',
    tagline: 'Growing code and planting digital seeds!',
  },
  {
    key: 'luna-owl',
    name: 'Luna Owl',
    title: 'Midnight Stargazer',
    tagline: 'Wise AI vision and nocturnal algorithms!',
  },
  {
    key: 'turbo-turtle',
    name: 'Turbo Turtle',
    title: 'Rocket Speedster',
    tagline: 'Slow and steady? Nope, turbo-charged!',
  },
  {
    key: 'glitch-cat',
    name: 'Glitch Cat',
    title: 'Cyber Hacker Feline',
    tagline: 'Pouncing through firewalls and matrix puzzles!',
  },
  {
    key: 'pip-dragon',
    name: 'Pip the Dragon',
    title: 'Flame Synthesizer',
    tagline: 'Breathing creative spark into every project!',
  },
];

const POWER_COLORS = [
  { id: 'lime', name: 'Electric Lime', hex: '#B8F23C', glow: 'rgba(184,242,60,0.6)' },
  { id: 'lilac', name: 'Cosmic Lilac', hex: '#A98BFF', glow: 'rgba(169,139,255,0.6)' },
  { id: 'coral', name: 'Solar Coral', hex: '#FF6F61', glow: 'rgba(255,111,97,0.6)' },
  { id: 'cream', name: 'Starlight Cream', hex: '#FFF8E7', glow: 'rgba(255,248,231,0.6)' },
];

const INTERESTS = [
  { id: 'games', label: '🎮 Video Games', desc: 'Arcade games and interactive stories' },
  { id: 'drawing', label: '🎨 Art & Drawing', desc: 'AI images, digital illustrations, and animations' },
  { id: 'videos', label: '🎬 AI Videos', desc: 'Cinematic shorts and generative characters' },
  { id: 'robots', label: '🤖 Smart Robots', desc: 'AI bots, agents, and automated gadgets' },
];

// Helper to render the 8 Original Hero SVGs
function HeroSvg({ heroKey, color = '#B8F23C' }: { heroKey: string; color?: string }) {
  switch (heroKey) {
    case 'captain-bolt':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg bolt-anim">
          {/* Cape */}
          <path d="M40 70 Q20 120 28 148 Q80 135 120 148 Q140 120 120 70 Z" fill={color} opacity="0.85" className="cape-wave" />
          {/* Body */}
          <rect x="52" y="65" width="56" height="60" rx="16" fill="#2A1450" />
          <path d="M72 80 L88 80 L76 98 L88 98 L68 116 L76 102 L66 102 Z" fill={color} />
          {/* Head & Mask */}
          <circle cx="80" cy="46" r="32" fill="#FFE0B2" />
          <path d="M52 38 Q80 20 108 38 L104 54 Q80 44 56 54 Z" fill="#2A1450" />
          {/* Eyes */}
          <circle cx="68" cy="46" r="5" fill={color} className="hero-eye" />
          <circle cx="92" cy="46" r="5" fill={color} className="hero-eye" />
          {/* Lightning Antenna */}
          <path d="M80 18 L86 6 L78 6 L84 -2" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'pixel-pup':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg pup-anim">
          {/* Body */}
          <rect x="46" y="70" width="68" height="54" rx="20" fill="#2A1450" />
          <circle cx="80" cy="98" r="14" fill={color} opacity="0.3" />
          {/* Head */}
          <rect x="44" y="28" width="72" height="60" rx="24" fill="#3B1F6D" />
          {/* Floppy Ears */}
          <rect x="26" y="32" width="22" height="42" rx="11" fill={color} className="ear-left" />
          <rect x="112" y="32" width="22" height="42" rx="11" fill={color} className="ear-right" />
          {/* Snout & Eyes */}
          <ellipse cx="80" cy="65" rx="18" ry="14" fill="#FFF8E7" />
          <ellipse cx="80" cy="58" rx="7" ry="5" fill="#2A1450" />
          <circle cx="62" cy="46" r="6" fill={color} className="hero-eye" />
          <circle cx="98" cy="46" r="6" fill={color} className="hero-eye" />
          {/* Collar */}
          <rect x="52" y="78" width="56" height="8" rx="4" fill={color} />
        </svg>
      );
    case 'nova-fox':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg fox-anim">
          {/* Big Fluffy Tail */}
          <path d="M104 100 Q146 110 148 70 Q140 40 115 54 Q108 80 104 100 Z" fill={color} className="tail-wag" />
          {/* Suit */}
          <rect x="50" y="72" width="60" height="56" rx="18" fill="#180A31" />
          <circle cx="80" cy="100" r="12" fill={color} />
          {/* Head */}
          <polygon points="40,24 60,60 30,55" fill={color} />
          <polygon points="120,24 100,60 130,55" fill={color} />
          <ellipse cx="80" cy="52" rx="36" ry="28" fill="#FF8A65" />
          <polygon points="80,72 68,54 92,54" fill="#2A1450" />
          {/* Space Visor */}
          <path d="M52 46 Q80 34 108 46 Q80 62 52 46 Z" fill={color} opacity="0.85" />
        </svg>
      );
    case 'robo-sprout':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg sprout-anim">
          {/* Pot/Body */}
          <rect x="52" y="74" width="56" height="52" rx="14" fill="#2A1450" />
          <rect x="46" y="68" width="68" height="12" rx="6" fill={color} />
          {/* Robot Head */}
          <rect x="54" y="28" width="52" height="42" rx="14" fill="#3B1F6D" />
          {/* Glowing Pill Visor */}
          <rect x="62" y="40" width="36" height="18" rx="9" fill={color} className="hero-glow" />
          {/* Sprout Leaf Antenna */}
          <path d="M80 28 L80 12 Q80 2 96 2 Q96 14 80 14 Z" fill={color} className="leaf-sway" />
          <path d="M80 16 Q80 6 64 6 Q64 18 80 18 Z" fill="#FFF8E7" opacity="0.8" className="leaf-sway" />
        </svg>
      );
    case 'luna-owl':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg owl-anim">
          {/* Wings */}
          <ellipse cx="44" cy="85" rx="14" ry="32" fill={color} opacity="0.75" />
          <ellipse cx="116" cy="85" rx="14" ry="32" fill={color} opacity="0.75" />
          {/* Body */}
          <ellipse cx="80" cy="80" rx="38" ry="46" fill="#2A1450" />
          {/* Feather tummy */}
          <path d="M72 84 Q80 90 88 84 Q80 96 72 84 Z" fill={color} />
          <path d="M72 96 Q80 102 88 96 Q80 108 72 96 Z" fill={color} />
          {/* Big Goggle Eyes */}
          <circle cx="64" cy="52" r="18" fill="#FFF8E7" stroke={color} strokeWidth="4" />
          <circle cx="96" cy="52" r="18" fill="#FFF8E7" stroke={color} strokeWidth="4" />
          <circle cx="64" cy="52" r="7" fill="#2A1450" className="hero-eye" />
          <circle cx="96" cy="52" r="7" fill="#2A1450" className="hero-eye" />
          {/* Beak & Ear Feathers */}
          <polygon points="76,64 84,64 80,74" fill="#FFB74D" />
          <polygon points="50,22 58,40 44,38" fill={color} />
          <polygon points="110,22 102,40 116,38" fill={color} />
        </svg>
      );
    case 'turbo-turtle':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg turtle-anim">
          {/* Rocket Thrusters */}
          <rect x="34" y="92" width="16" height="30" rx="6" fill="#3B1F6D" />
          <polygon points="34,122 50,122 42,142" fill="#FF7043" className="rocket-flame" />
          <rect x="110" y="92" width="16" height="30" rx="6" fill="#3B1F6D" />
          <polygon points="110,122 126,122 118,142" fill="#FF7043" className="rocket-flame" />
          {/* Shell */}
          <ellipse cx="80" cy="78" rx="42" ry="38" fill="#2A1450" />
          <ellipse cx="80" cy="78" rx="34" ry="30" fill={color} opacity="0.3" />
          <circle cx="80" cy="78" r="12" fill={color} />
          {/* Head & Goggles */}
          <circle cx="80" cy="38" r="20" fill="#81C784" />
          <rect x="66" y="32" width="28" height="14" rx="7" fill={color} />
          <circle cx="73" cy="39" r="4" fill="#2A1450" />
          <circle cx="87" cy="39" r="4" fill="#2A1450" />
        </svg>
      );
    case 'glitch-cat':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg cat-anim">
          {/* Cyber Tail */}
          <path d="M106 100 Q138 90 134 58" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" className="tail-wag" />
          {/* Body */}
          <rect x="52" y="70" width="56" height="54" rx="16" fill="#180A31" />
          <path d="M66 84 L94 84 M70 94 L90 94 M74 104 L86 104" stroke={color} strokeWidth="3" opacity="0.6" />
          {/* Cat Head */}
          <polygon points="46,26 62,54 42,50" fill={color} />
          <polygon points="114,26 98,54 118,50" fill={color} />
          <rect x="48" y="36" width="64" height="46" rx="20" fill="#2A1450" />
          {/* Visor / Neon Eyes */}
          <polygon points="62,54 72,46 72,62" fill={color} className="hero-eye" />
          <polygon points="98,54 88,46 88,62" fill={color} className="hero-eye" />
          <circle cx="80" cy="64" r="3" fill="#FFF8E7" />
        </svg>
      );
    case 'pip-dragon':
      return (
        <svg viewBox="0 0 160 160" className="hero-svg dragon-anim">
          {/* Dragon Wings */}
          <path d="M42 60 Q10 40 22 84 Q34 76 46 74 Z" fill={color} className="wing-flap" />
          <path d="M118 60 Q150 40 138 84 Q126 76 114 74 Z" fill={color} className="wing-flap" />
          {/* Body */}
          <ellipse cx="80" cy="88" rx="34" ry="38" fill="#2A1450" />
          <ellipse cx="80" cy="94" rx="18" ry="22" fill={color} opacity="0.35" />
          {/* Head & Horns */}
          <polygon points="64,22 72,36 60,34" fill="#FFB74D" />
          <polygon points="96,22 88,36 100,34" fill="#FFB74D" />
          <circle cx="80" cy="48" r="26" fill="#4A148C" />
          {/* Big Sparkly Eyes */}
          <circle cx="68" cy="46" r="7" fill={color} className="hero-eye" />
          <circle cx="92" cy="46" r="7" fill={color} className="hero-eye" />
          {/* Snout with mini puff smoke */}
          <ellipse cx="80" cy="58" rx="10" ry="6" fill="#6A1B9A" />
          <circle cx="77" cy="58" r="1.5" fill={color} />
          <circle cx="83" cy="58" r="1.5" fill={color} />
        </svg>
      );
    default:
      return null;
  }
}

export default function KidHeroBuilder({ parentId, parentEmail, onFinishAll }: KidHeroBuilderProps) {
  const [step, setStep] = useState<number>(1); // 1: Hero, 2: Color, 3: Name & Age, 4: PIN, 5: Interest, 6: Celebration
  const [selectedHeroIndex, setSelectedHeroIndex] = useState<number>(0);
  const [powerColor, setPowerColor] = useState<string>('lime');
  const [heroName, setHeroName] = useState<string>('');
  const [ageBand, setAgeBand] = useState<'6-9' | '10-13'>('6-9');
  const [pinDigits, setPinDigits] = useState<string>('');
  const [interest, setInterest] = useState<string>('games');
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [createdHeroes, setCreatedHeroes] = useState<CreatedHero[]>([]);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const currentHero = HEROES[selectedHeroIndex];
  const activeColorObj = POWER_COLORS.find((c) => c.id === powerColor) || POWER_COLORS[0];

  // Name validation: nicknames only, letters and numbers, 2-15 chars, no real surnames
  const validateName = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Give your hero a nickname!');
      return false;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return false;
    }
    if (trimmed.length > 15) {
      setNameError('Keep it under 15 characters.');
      return false;
    }
    if (/\s/.test(trimmed)) {
      setNameError('One-word nicknames only! No real surnames.');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setNameError('Letters, numbers, and dashes only.');
      return false;
    }
    setNameError(null);
    return true;
  };

  // PIN Keypad handler
  const handleKeypadPress = (val: string) => {
    playPinKey();
    if (val === 'back') {
      setPinDigits((prev) => prev.slice(0, -1));
      setPinError(null);
      return;
    }
    if (pinDigits.length < 4) {
      const nextPin = pinDigits + val;
      setPinDigits(nextPin);
      if (nextPin.length === 4) {
        setPinError(null);
      }
    }
  };

  // Save Hero to Supabase
  const handleSaveHero = async () => {
    if (pinDigits.length !== 4) {
      setPinError('Choose a 4-digit PIN for your hero!');
      return;
    }

    setIsSaving(true);
    const client = getSupabase();
    let learnerId = `demo-${Date.now()}`;

    if (client && parentId) {
      const { data, error } = await client
        .from('learners')
        .insert({
          parent_id: parentId,
          display_name: heroName.trim(),
          age_band: ageBand,
          avatar_key: currentHero.key,
          xp: 100, // Welcome XP!
          level: 1,
        })
        .select('id')
        .single();

      if (!error && data?.id) {
        learnerId = data.id;
        await setChildPin(learnerId, pinDigits);
      }
    } else {
      // Local fallback
      try {
        localStorage.setItem(`seedai_hero_${learnerId}`, JSON.stringify({
          heroName,
          heroKey: currentHero.key,
          powerColor,
          ageBand,
          interest,
          pin: pinDigits,
        }));
      } catch {}
    }

    const newHero: CreatedHero = {
      id: learnerId,
      name: heroName.trim(),
      heroKey: currentHero.key,
      powerColor: activeColorObj.hex,
      ageBand,
      interest,
    };

    setCreatedHeroes((prev) => [...prev, newHero]);
    setIsSaving(false);
    playFanfare();
    setStep(6); // Celebration trading card!
  };

  const handleAddAnother = () => {
    setHeroName('');
    setPinDigits('');
    setStep(1);
    setSelectedHeroIndex((prev) => (prev + 1) % HEROES.length);
  };

  return (
    <div className="kid-world" data-theme-color={powerColor}>
      {/* Sound Toggle */}
      <button
        type="button"
        className="sound-toggle"
        onClick={toggleSound}
        title={soundOn ? 'Sound FX On' : 'Sound FX Off'}
        aria-label="Sound effects toggle"
      >
        {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      {/* Floating Parallax Atmosphere */}
      <div className="kw-stars" aria-hidden="true" />
      <div className="kw-clouds" aria-hidden="true">
        <span className="kw-cloud c1" />
        <span className="kw-cloud c2" />
        <span className="kw-cloud c3" />
      </div>

      <div className="kw-container">
        {/* Seedbot Guide */}
        <div className="kw-guide">
          <div className="kw-bot-bubble">
            {step === 1 && "Pick your favorite hero to lead your coding adventures!"}
            {step === 2 && `Choose ${currentHero.name}'s power aura color!`}
            {step === 3 && "What is your secret hero code-name?"}
            {step === 4 && "Set your secret 4-digit hero PIN to log into your quests!"}
            {step === 5 && "What do you want to build first with AI?"}
            {step === 6 && "Boom! Your Hero Card is ready for missions!"}
          </div>
          <svg className="kw-bot-avatar" viewBox="0 0 200 200" aria-hidden="true">
            <use href="#seedai-mark" />
          </svg>
        </div>

        {/* STEP 1: CHOOSE HERO CAROUSEL */}
        {step === 1 && (
          <div className="kw-step-card reveal is-in">
            <p className="kw-step-badge">Step 1 of 5</p>
            <h2 className="kw-title">Pick Your Hero</h2>
            <p className="kw-sub">Meet Seed AI's original heroes. Swipe or tap to choose!</p>

            <div className="kw-hero-carousel">
              <button
                type="button"
                className="kw-nav-arrow"
                onClick={() => {
                  playHeroSelect();
                  setSelectedHeroIndex((prev) => (prev === 0 ? HEROES.length - 1 : prev - 1));
                }}
                aria-label="Previous hero"
              >
                ←
              </button>

              <div className="kw-hero-display" style={{ borderColor: activeColorObj.hex }}>
                <div className="kw-avatar-glow" style={{ boxShadow: `0 0 50px ${activeColorObj.glow}` }}>
                  <HeroSvg heroKey={currentHero.key} color={activeColorObj.hex} />
                </div>
                <h3 className="kw-hero-name" style={{ color: activeColorObj.hex }}>
                  {currentHero.name}
                </h3>
                <span className="kw-hero-title">{currentHero.title}</span>
                <p className="kw-hero-tagline">{currentHero.tagline}</p>
              </div>

              <button
                type="button"
                className="kw-nav-arrow"
                onClick={() => {
                  playHeroSelect();
                  setSelectedHeroIndex((prev) => (prev === HEROES.length - 1 ? 0 : prev + 1));
                }}
                aria-label="Next hero"
              >
                →
              </button>
            </div>

            <div className="kw-hero-dots">
              {HEROES.map((h, i) => (
                <button
                  key={h.key}
                  type="button"
                  className={`kw-hdot ${i === selectedHeroIndex ? 'is-active' : ''}`}
                  onClick={() => {
                    playHeroSelect();
                    setSelectedHeroIndex(i);
                  }}
                  aria-label={h.name}
                />
              ))}
            </div>

            <div className="kw-actions">
              <button
                type="button"
                className="btn btn-lime btn-lg kw-btn"
                onClick={() => {
                  playPowerColor();
                  setStep(2);
                }}
              >
                Choose {currentHero.name} →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: POWER COLOR */}
        {step === 2 && (
          <div className="kw-step-card reveal is-in">
            <p className="kw-step-badge">Step 2 of 5</p>
            <h2 className="kw-title">Select Power Aura</h2>
            <p className="kw-sub">What energy fuels {currentHero.name}?</p>

            <div className="kw-hero-preview-mini">
              <HeroSvg heroKey={currentHero.key} color={activeColorObj.hex} />
            </div>

            <div className="kw-colors-grid">
              {POWER_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={`kw-color-btn ${powerColor === col.id ? 'is-selected' : ''}`}
                  style={{
                    borderColor: col.hex,
                    boxShadow: powerColor === col.id ? `0 0 25px ${col.glow}` : 'none',
                  }}
                  onClick={() => {
                    playPowerColor();
                    setPowerColor(col.id);
                  }}
                >
                  <span className="kw-col-swatch" style={{ background: col.hex }} />
                  <span className="kw-col-label">{col.name}</span>
                </button>
              ))}
            </div>

            <div className="kw-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" className="btn btn-lime btn-lg kw-btn" onClick={() => setStep(3)}>
                Power Up →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HERO NAME & AGE */}
        {step === 3 && (
          <div className="kw-step-card reveal is-in">
            <p className="kw-step-badge">Step 3 of 5</p>
            <h2 className="kw-title">Name Your Hero</h2>
            <p className="kw-sub">Choose a cool one-word nickname (no real surnames for safety!)</p>

            <div className="kw-field-group">
              <label htmlFor="heroNameInput" className="kw-field-label">
                Hero Nickname:
              </label>
              <input
                id="heroNameInput"
                type="text"
                maxLength={15}
                className={`kw-text-input ${nameError ? 'has-error' : ''}`}
                placeholder="e.g. ShadowNova, BoltKid, CyberPip"
                value={heroName}
                onChange={(e) => {
                  setHeroName(e.target.value);
                  validateName(e.target.value);
                }}
              />
              {nameError && <p className="kw-err-text">{nameError}</p>}
            </div>

            <div className="kw-field-group" style={{ marginTop: '1.2rem' }}>
              <label className="kw-field-label">Age Group:</label>
              <div className="kw-age-tabs">
                <button
                  type="button"
                  className={`kw-age-btn ${ageBand === '6-9' ? 'is-active' : ''}`}
                  onClick={() => setAgeBand('6-9')}
                >
                  🌱 Ages 6 to 9 (Visual & Playful)
                </button>
                <button
                  type="button"
                  className={`kw-age-btn ${ageBand === '10-13' ? 'is-active' : ''}`}
                  onClick={() => setAgeBand('10-13')}
                >
                  🚀 Ages 10 to 13 (Creators & Coders)
                </button>
              </div>
            </div>

            <div className="kw-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-lime btn-lg kw-btn"
                onClick={() => {
                  if (validateName(heroName)) {
                    setStep(4);
                  }
                }}
              >
                Set Secret PIN →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SECRET PIN KEYPAD */}
        {step === 4 && (
          <div className="kw-step-card reveal is-in">
            <p className="kw-step-badge">Step 4 of 5</p>
            <h2 className="kw-title">Secret 4-Digit PIN</h2>
            <p className="kw-sub">
              Your child will tap this PIN to enter their hero world without needing passwords!
            </p>

            <div className="kw-pin-display">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`kw-pin-dot ${pinDigits.length > i ? 'is-filled' : ''}`}>
                  {pinDigits.length > i ? '●' : ''}
                </div>
              ))}
            </div>
            {pinError && <p className="kw-err-text">{pinError}</p>}

            <div className="kw-keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((k, idx) => {
                if (k === '') return <div key={idx} className="kw-keypad-blank" />;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`kw-key ${k === 'back' ? 'is-back' : ''}`}
                    onClick={() => handleKeypadPress(k)}
                  >
                    {k === 'back' ? '⌫' : k}
                  </button>
                );
              })}
            </div>

            <div className="kw-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-lime btn-lg kw-btn"
                disabled={pinDigits.length !== 4}
                onClick={() => setStep(5)}
              >
                Pick Quests →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FAVORITE LEARNING TRACK */}
        {step === 5 && (
          <div className="kw-step-card reveal is-in">
            <p className="kw-step-badge">Step 5 of 5</p>
            <h2 className="kw-title">What Will You Build?</h2>
            <p className="kw-sub">Pick your favorite thing to learn first:</p>

            <div className="kw-interest-grid">
              {INTERESTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`kw-interest-btn ${interest === item.id ? 'is-selected' : ''}`}
                  onClick={() => setInterest(item.id)}
                >
                  <span className="kw-int-title">{item.label}</span>
                  <span className="kw-int-desc">{item.desc}</span>
                </button>
              ))}
            </div>

            <div className="kw-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(4)}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-lime btn-lg kw-btn"
                disabled={isSaving}
                onClick={handleSaveHero}
              >
                {isSaving ? 'Creating Hero...' : '🎉 Launch Hero Card!'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: CELEBRATION TRADING CARD */}
        {step === 6 && (
          <div className="kw-step-card reveal is-in kw-celebrate">
            <div className="confetti-burst" aria-hidden="true" />
            <h2 className="kw-title-yay">Hero Created! 🌟</h2>
            <p className="kw-sub">Welcome to Seed AI Academy, {heroName}!</p>

            {/* 3D Trading Card */}
            <div className="trading-card-wrap">
              <div
                className="trading-card"
                style={{
                  borderColor: activeColorObj.hex,
                  boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 35px ${activeColorObj.glow}`,
                }}
              >
                <div className="tc-badge" style={{ background: activeColorObj.hex }}>
                  LVL 1 HERO
                </div>
                <div className="tc-avatar">
                  <HeroSvg heroKey={currentHero.key} color={activeColorObj.hex} />
                </div>
                <h3 className="tc-name" style={{ color: activeColorObj.hex }}>
                  {heroName}
                </h3>
                <span className="tc-role">{currentHero.name} • {currentHero.title}</span>

                <div className="tc-stats">
                  <div className="tc-stat">
                    <span>Power Aura</span>
                    <strong style={{ color: activeColorObj.hex }}>{activeColorObj.name}</strong>
                  </div>
                  <div className="tc-stat">
                    <span>Starting XP</span>
                    <strong>100 XP</strong>
                  </div>
                </div>

                <div className="tc-badge-pin">
                  <span>Parent PIN Protected</span>
                </div>
              </div>
            </div>

            <div className="kw-actions kw-final-actions">
              <button type="button" className="btn btn-ghost btn-lg" onClick={handleAddAnother}>
                + Add Another Child / Hero
              </button>
              <button
                type="button"
                className="btn btn-lime btn-lg"
                onClick={() => {
                  if (onFinishAll) {
                    onFinishAll(createdHeroes);
                  } else {
                    window.location.href = '/dashboard/parent';
                  }
                }}
              >
                Go to Parent Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Lime Hills */}
      <div className="kw-ground" aria-hidden="true">
        <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="kw-hills">
          <path d="M0 90 Q360 20 720 80 T1440 60 L1440 180 L0 180 Z" fill="#94CC25" opacity="0.4" />
          <path d="M0 120 Q360 60 720 110 T1440 90 L1440 180 L0 180 Z" fill="#B8F23C" />
        </svg>
      </div>
    </div>
  );
}
