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
