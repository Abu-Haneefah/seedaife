'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import OtpVerification from './OtpVerification';
import CountrySelect from '@/components/ui/CountrySelect';
import CustomSelect from '@/components/ui/CustomSelect';

interface AdultRegisterProps {
  onBack: () => void;
}

const TRACKS = [
  { id: 'accountant', label: '💼 Finance / Accountant', desc: 'Automate spreadsheets, audit reconciliations, and reporting' },
  { id: 'content_creator', label: '🎨 Content Creator', desc: 'Generative video, graphic workflows, copy & marketing assets' },
  { id: 'educator', label: '🎓 Educator / Teacher', desc: 'Custom curriculum generation, student AI tools & quizzes' },
  { id: 'career_changer', label: '🚀 Career Changer / Tech Explorer', desc: 'Learn vibe coding, build full apps & transition into tech' },
  { id: 'other', label: '✨ General Professional / Adult', desc: 'Personal productivity, AI agents & workflow automation' },
];

export default function AdultRegister({ onBack }: AdultRegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('Nigeria');
  const [track, setTrack] = useState('accountant');
  const [schedule, setSchedule] = useState('evening');
  const [goals, setGoals] = useState<string[]>(['automate']);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    const client = getSupabase();
    if (!client) {
      setTimeout(() => {
        setLoading(false);
        setAwaitingOtp(true);
      }, 700);
      return;
    }

    const { error: signUpError } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          role: 'learner',
          full_name: fullName.trim(),
          country,
          audience_type: 'professional',
          professional_track: track,
          schedule,
          goals: goals.join(','),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setAwaitingOtp(true);
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    const client = getSupabase();
    if (!client) {
      setTimeout(() => {
        window.location.href = '/dashboard/learner';
      }, 800);
      return;
    }

    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/learner` : '';

    const { error: oauthErr } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (oauthErr) {
      setOauthLoading(false);
      setError(oauthErr.message);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setError(null);
    const client = getSupabase();

    if (!client) {
      window.location.href = '/dashboard/learner';
      return;
    }

    const { error: verifyError } = await client.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      throw new Error(verifyError.message || 'Invalid code. Please try again.');
    }

    window.location.href = '/dashboard/learner';
  };

  const handleResendOtp = async () => {
    const client = getSupabase();
    if (!client) return;
    await client.auth.resend({ type: 'signup', email: email.trim() });
  };

  if (awaitingOtp) {
    return (
      <OtpVerification
        email={email}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={() => setAwaitingOtp(false)}
        error={error}
      />
    );
  }

  return (
    <div className="reg-split-wrap reveal is-in">
      {/* Left side: branding & track overview */}
      <div className="reg-split-info">
        <button type="button" className="reg-back-btn" onClick={onBack}>
          ← Back to roles
        </button>

        <div className="pro-badge">Adult & Professional Track</div>
        <h2>Go From Using AI to Building With AI</h2>
        <p className="pro-desc">
          Accelerate your career with real-world generative AI skills, automated workflows, and vibe coding.
        </p>

        <div className="pro-perks">
          <div className="pro-perk">
            <span className="perk-ico">✓</span>
            <div>
              <strong>Practical Portfolio Projects</strong>
              <p>Deploy working web applications and custom AI agents.</p>
            </div>
          </div>
          <div className="pro-perk">
            <span className="perk-ico">✓</span>
            <div>
              <strong>Flexible Schedules</strong>
              <p>Evening sessions, recorded lectures, and live instructor labs.</p>
            </div>
          </div>
          <div className="pro-perk">
            <span className="perk-ico">✓</span>
            <div>
              <strong>Role-Specific Tracks</strong>
              <p>Tailored for finance, content creation, education, and development.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: form */}
      <div className="reg-split-form-card">
        {/* Google OAuth */}
        <button type="button" className="btn-oauth-google" onClick={handleGoogleSignIn} disabled={oauthLoading}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{oauthLoading ? 'Connecting...' : 'Sign up with Google'}</span>
        </button>

        <div className="reg-divider">
          <span>or fill your profile</span>
        </div>

        {error && <div className="field-err reg-err-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="field">
            <label htmlFor="aName">Full Name</label>
            <input
              id="aName"
              type="text"
              required
              placeholder="e.g. David Okonjo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="aEmail">Email Address</label>
            <input
              id="aEmail"
              type="email"
              required
              placeholder="david@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="reg-form-row">
            <div className="field">
              <label htmlFor="aCountry">Country</label>
              <CountrySelect
                id="aCountry"
                value={country}
                onChange={setCountry}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="aSchedule">Preferred Schedule</label>
              <CustomSelect
                id="aSchedule"
                value={schedule}
                onChange={setSchedule}
                options={[
                  { value: 'evening', label: 'Weekday Evenings', hint: 'Mon & Wed 7pm GMT' },
                  { value: 'weekend', label: 'Weekends (Sat & Sun)', hint: 'Live weekend workshops' },
                  { value: 'self_paced', label: 'Self-Paced with Lab Hours', hint: 'Learn on your schedule' },
                ]}
              />
            </div>
          </div>

          <div className="field">
            <label>Professional Focus Track</label>
            <div className="pro-tracks-list">
              {TRACKS.map((t) => (
                <label
                  key={t.id}
                  className={`track-radio-item ${track === t.id ? 'is-checked' : ''}`}
                >
                  <input
                    type="radio"
                    name="proTrack"
                    value={t.id}
                    checked={track === t.id}
                    onChange={() => setTrack(t.id)}
                  />
                  <div className="track-radio-content">
                    <strong>{t.label}</strong>
                    <span>{t.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="aPassword">Password</label>
            <div className="password-wrap">
              <input
                id="aPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-lime btn-lg reg-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Start Learning →'}
          </button>
        </form>
      </div>
    </div>
  );
}
