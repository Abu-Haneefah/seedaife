'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import OtpVerification from './OtpVerification';
import CustomSelect from '@/components/ui/CustomSelect';

interface TeenRegisterProps {
  onBack: () => void;
}

export default function TeenRegister({ onBack }: TeenRegisterProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('14');
  const [interests, setInterests] = useState<string[]>(['web']);
  const [parentEmail, setParentEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [isPendingConsent, setIsPendingConsent] = useState(false);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (parentEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      setError('Parent email must be different from your own email.');
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

    const { data, error: signUpError } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          role: 'learner',
          display_name: displayName.trim(),
          age_band: '14-18',
          audience_type: 'teen',
          parent_consent_email: parentEmail.trim(),
          interests: interests.join(','),
          consent_pending: true,
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
        setIsPendingConsent(true);
      }, 800);
      return;
    }

    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/register?flow=teen&status=pending` : '';

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
      setIsPendingConsent(true);
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

    setIsPendingConsent(true);
  };

  const handleResendOtp = async () => {
    const client = getSupabase();
    if (!client) return;
    await client.auth.resend({ type: 'signup', email: email.trim() });
  };

  if (isPendingConsent) {
    return (
      <div className="reg-flow-card reg-pending-card reveal is-in">
        <div className="pending-icon">⏳</div>
        <h2>Waiting for Parent Consent</h2>
        <p className="reg-lead">
          Awesome work, <strong>{displayName}</strong>! Your teen learner account is almost ready.
        </p>
        <div className="pending-box">
          <p>
            Because you are under 18, we sent a verification & consent link to your parent at:
            <br />
            <strong>{parentEmail}</strong>
          </p>
          <p className="pending-sub">
            Once your parent clicks the confirmation link or approves you in their parent dashboard, you will be able to log in, join live classes, and build cool AI projects!
          </p>
        </div>
        <div className="pending-actions">
          <button type="button" className="btn btn-lime btn-lg" onClick={() => (window.location.href = '/')}>
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

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
    <div className="reg-flow-card reg-teen-card reveal is-in">
      <div className="teen-grid-bg" aria-hidden="true" />
      <div className="reg-header">
        <button type="button" className="reg-back-btn" onClick={onBack}>
          ← Back to roles
        </button>
        <span className="reg-badge teen-badge">Teen Builder Track (13–17)</span>
      </div>

      <h2>Level Up With Real Code & AI</h2>
      <p className="reg-lead">
        Build live web apps, generative AI systems, and vibe-coding projects for your portfolio.
      </p>

      {/* Google OAuth */}
      <button type="button" className="btn-oauth-google" onClick={handleGoogleSignIn} disabled={oauthLoading}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{oauthLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      <div className="reg-divider">
        <span>or register with email</span>
      </div>

      {error && <div className="field-err reg-err-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="reg-form">
        <div className="reg-form-row">
          <div className="field">
            <label htmlFor="tDisplayName">Your Display / Coder Name</label>
            <input
              id="tDisplayName"
              type="text"
              required
              placeholder="e.g. AlexDev"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="tAge">Your Age</label>
            <CustomSelect
              id="tAge"
              value={age}
              onChange={setAge}
              options={[
                { value: '13', label: '13 years old' },
                { value: '14', label: '14 years old' },
                { value: '15', label: '15 years old' },
                { value: '16', label: '16 years old' },
                { value: '17', label: '17 years old' },
              ]}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="tEmail">Your Email</label>
          <input
            id="tEmail"
            type="email"
            required
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="tParentEmail">Parent or Guardian Email (Required)</label>
          <input
            id="tParentEmail"
            type="email"
            required
            placeholder="parent@example.com"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
          <span className="field-hint">We'll send a 1-click consent link to your parent.</span>
        </div>

        <div className="field">
          <label htmlFor="tPassword">Password</label>
          <div className="password-wrap">
            <input
              id="tPassword"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
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

        <div className="field">
          <label>What are you most excited to build?</label>
          <div className="chips-picker">
            {[
              { id: 'web', label: '🌐 Websites' },
              { id: 'genai', label: '🤖 AI Models & Prompts' },
              { id: 'agents', label: '⚡ Vibe Coding & Agents' },
              { id: 'games', label: '🎮 Games & React Apps' },
            ].map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`chip-btn ${interests.includes(tag.id) ? 'is-active' : ''}`}
                onClick={() => toggleInterest(tag.id)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-lime btn-lg reg-submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Create Teen Account →'}
        </button>
      </form>
    </div>
  );
}
