'use client';

import React, { useState, useEffect } from 'react';
import HeroSvg from '@/components/common/HeroSvg';
import { getSupabase, verifyChildPin, fetchParentLearners, Learner } from '@/lib/supabase';
import { MascotReaction } from './LoginSeedbot';

interface KidHeroLoginProps {
  onReactionChange: (reaction: MascotReaction) => void;
  onSuccess: (learner: Learner) => void;
  onSwitchToParentLogin: () => void;
}

const DEFAULT_DEMO_HEROES: Learner[] = [
  {
    id: 'hero-demo-1',
    display_name: 'Captain Bolt',
    age_band: '6-9',
    avatar_key: 'captain-bolt',
    xp: 250,
    level: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'hero-demo-2',
    display_name: 'Nova Fox',
    age_band: '10-13',
    avatar_key: 'nova-fox',
    xp: 480,
    level: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'hero-demo-3',
    display_name: 'Robo Sprout',
    age_band: '6-9',
    avatar_key: 'robo-sprout',
    xp: 120,
    level: 1,
    created_at: new Date().toISOString(),
  },
];

export default function KidHeroLogin({
  onReactionChange,
  onSuccess,
  onSwitchToParentLogin,
}: KidHeroLoginProps) {
  const [heroes, setHeroes] = useState<Learner[]>([]);
  const [selectedHero, setSelectedHero] = useState<Learner | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  // Check lockout state from localStorage on load
  useEffect(() => {
    try {
      const lockUntil = localStorage.getItem('seedai_kid_pin_lockout');
      if (lockUntil) {
        const remaining = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutRemaining(remaining);
        } else {
          localStorage.removeItem('seedai_kid_pin_lockout');
        }
      }
    } catch {}
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutRemaining) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (!prev || prev <= 1) {
          try {
            localStorage.removeItem('seedai_kid_pin_lockout');
          } catch {}
          setFailedAttempts(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Load heroes for the active parent
  useEffect(() => {
    async function loadLearners() {
      setLoading(true);
      const client = getSupabase();
      if (!client) {
        // Fallback demo heroes
        setHeroes(DEFAULT_DEMO_HEROES);
        setSelectedHero(DEFAULT_DEMO_HEROES[0]);
        setLoading(false);
        return;
      }

      let combined: Learner[] = [];
      const stored = localStorage.getItem('seedai_demo_learners');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            combined = [...list];
          }
        } catch {}
      }

      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const dbList = await fetchParentLearners(user.id);
        if (dbList && dbList.length > 0) {
          // Merge avoiding duplicates by id
          dbList.forEach((dbHero) => {
            if (!combined.some((h) => h.id === dbHero.id)) {
              combined.push(dbHero);
            }
          });
        }
      }

      if (combined.length === 0) {
        combined = [...DEFAULT_DEMO_HEROES];
      }

      setHeroes(combined);
      setSelectedHero(combined[0]);
      setLoading(false);
    }

    loadLearners();
  }, []);

  const handleKeypadPress = (key: string) => {
    if (lockoutRemaining || verifying) return;
    setError(null);

    if (key === 'back') {
      setPinDigits((prev) => prev.slice(0, -1));
      return;
    }

    if (pinDigits.length < 4) {
      const next = [...pinDigits, key];
      setPinDigits(next);
      if (next.length === 4) {
        verifyPin(next.join(''));
      }
    }
  };

  const verifyPin = async (code: string) => {
    if (!selectedHero) return;
    setVerifying(true);

    const valid = await verifyChildPin(selectedHero.id, code);

    if (valid) {
      onReactionChange('success');
      try {
        localStorage.setItem('seedai_active_kid_hero', JSON.stringify(selectedHero));
      } catch {}
      setTimeout(() => {
        onSuccess(selectedHero);
      }, 700);
    } else {
      onReactionChange('error');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 550);

      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      setPinDigits([]);
      setVerifying(false);

      if (nextAttempts >= 5) {
        const lockDuration = 5 * 60; // 5 minutes
        try {
          localStorage.setItem('seedai_kid_pin_lockout', String(Date.now() + lockDuration * 1000));
        } catch {}
        setLockoutRemaining(lockDuration);
        setError('Too many failed attempts. PIN keypad locked for 5 minutes.');
      } else {
        setError(`Incorrect PIN. ${5 - nextAttempts} attempts remaining.`);
      }
    }
  };

  if (loading) {
    return <div className="loading-stage">Gathering heroes...</div>;
  }

  return (
    <div className="kid-login-wrap">
      <div className="kid-login-header">
        <span className="kid-login-tag">🛡️ KID HERO LOGIN</span>
        <h2>Choose Your Hero</h2>
        <p className="kid-login-sub">Tap your hero card, then enter your secret 4-digit PIN!</p>
      </div>

      {/* Hero Avatar Switcher Carousel */}
      <div className="kid-hero-row">
        {heroes.map((hero) => {
          const isSelected = selectedHero?.id === hero.id;
          return (
            <button
              key={hero.id}
              type="button"
              className={`kid-hero-pill ${isSelected ? 'is-selected' : ''}`}
              onClick={() => {
                setSelectedHero(hero);
                setPinDigits([]);
                setError(null);
                onReactionChange('idle');
              }}
            >
              <div className="kid-hero-avatar-box">
                <HeroSvg heroKey={hero.avatar_key || 'captain-bolt'} color={isSelected ? '#B8F23C' : '#A98BFF'} />
              </div>
              <span className="kid-hero-name">{hero.display_name}</span>
              <span className="kid-hero-lvl">Lvl {hero.level || 1}</span>
            </button>
          );
        })}
      </div>

      {/* Active Hero PIN Area */}
      {selectedHero && (
        <div className={`kid-pin-box ${shakeCard ? 'card-shake' : ''}`}>
          <div className="kid-pin-target">
            <span className="kid-pin-avatar-preview">
              <HeroSvg heroKey={selectedHero.avatar_key || 'captain-bolt'} color="#B8F23C" />
            </span>
            <div className="kid-pin-text">
              <h3>{selectedHero.display_name}</h3>
              <p>Enter 4-digit PIN</p>
            </div>
          </div>

          {/* Dots */}
          <div className="kw-pin-display">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`kw-pin-dot ${pinDigits.length > i ? 'is-filled' : ''} ${error ? 'is-err' : ''}`}
              >
                {pinDigits.length > i ? '●' : ''}
              </div>
            ))}
          </div>

          {error && <p className="kw-err-text">{error}</p>}
          {lockoutRemaining && (
            <div className="lockout-banner">
              ⏳ Locked for {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
            </div>
          )}

          {/* Keypad */}
          <div className="kw-keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((k, idx) => {
              if (k === '') return <div key={idx} className="kw-keypad-blank" />;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`kw-key ${k === 'back' ? 'is-back' : ''}`}
                  onClick={() => handleKeypadPress(k)}
                  disabled={Boolean(lockoutRemaining) || verifying}
                >
                  {k === 'back' ? '⌫' : k}
                </button>
              );
            })}
          </div>

          <div className="kid-login-footer">
            <button type="button" className="inline-link" onClick={onSwitchToParentLogin}>
              Switch to Parent Account Login →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
