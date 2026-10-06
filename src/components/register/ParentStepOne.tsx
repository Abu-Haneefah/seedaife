'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useModal } from '@/components/Modals';
import OtpVerification from './OtpVerification';
import CountrySelect from '@/components/ui/CountrySelect';

interface ParentStepOneProps {
  onSuccess: (parentId: string, email: string) => void;
  onBack: () => void;
}

export default function ParentStepOne({ onSuccess, onBack }: ParentStepOneProps) {
  const { openModal } = useModal();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Live password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#FF6F61' };
      case 2:
        return { score: 2, label: 'Fair', color: '#FFB84D' };
      case 3:
        return { score: 3, label: 'Good', color: '#A98BFF' };
      case 4:
      default:
        return { score: 4, label: 'Strong', color: '#B8F23C' };
    }
  };

  const strength = getPasswordStrength(password);

  // Email + Password Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please check the parent consent checkbox to continue.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    const client = getSupabase();
    if (!client) {
      // Local demo mode fallback
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
          role: 'parent',
          full_name: fullName.trim(),
          phone: phone.trim(),
          country,
          audience_type: 'parent',
          consent: 'true',
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data?.user?.id) {
      setUserId(data.user.id);
    }

    // Advance to 6-digit OTP verification screen
    setAwaitingOtp(true);
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    const client = getSupabase();
    if (!client) {
      // Mock fallback
      setTimeout(() => {
        onSuccess(`demo-${Date.now()}`, 'parent@demo.com');
      }, 800);
      return;
    }

    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/register?flow=parent&step=hero` : '';

    const { error: oauthErr } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (oauthErr) {
      setOauthLoading(false);
      setError(oauthErr.message);
    }
  };

  // 6-digit OTP verification
  const handleVerifyOtp = async (code: string) => {
    setError(null);
    const client = getSupabase();

    if (!client) {
      // Mock demo mode
      onSuccess(userId || `demo-${Date.now()}`, email);
      return;
    }

    const { data, error: verifyError } = await client.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      // Check if code was for email change or standard verification
      const { data: magicData, error: magicErr } = await client.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      });

      if (magicErr) {
        throw new Error(verifyError.message || 'Invalid 6-digit code. Please check and try again.');
      }
      onSuccess(magicData.user?.id || userId || `user-${Date.now()}`, email);
      return;
    }

    onSuccess(data.user?.id || userId || `user-${Date.now()}`, email);
  };

  const handleResendOtp = async () => {
    const client = getSupabase();
    if (!client) return;

    const { error: resendErr } = await client.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (resendErr) {
      setError(resendErr.message);
    }
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
    <div className="reg-flow-card reg-parent-card">
      <div className="reg-header">
        <button type="button" className="reg-back-btn" onClick={onBack}>
          ← Back to roles
        </button>
        <span className="reg-badge">Parent & Child Registration</span>
      </div>

      <h2>Create Your Parent Account</h2>
      <p className="reg-lead">
        Set up your secure parent dashboard. On the next screen, you'll hand the device to your child to create their custom Hero Card!
      </p>

      {/* Google OAuth Button */}
      <button
        type="button"
        className="btn-oauth-google"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{oauthLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
      </button>

      <div className="reg-divider">
        <span>or sign up with email</span>
      </div>

      {error && <div className="field-err reg-err-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="reg-form">
        <div className="field">
          <label htmlFor="pFullName">Parent / Guardian Full Name</label>
          <input
            id="pFullName"
            type="text"
            required
            placeholder="e.g. Sarah Adebayo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="pEmail">Parent Email Address</label>
          <input
            id="pEmail"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="field-hint">Class notifications & progress reports are sent here.</span>
        </div>

        <div className="reg-form-row">
          <div className="field">
            <label htmlFor="pPhone">Phone Number (Optional)</label>
            <input
              id="pPhone"
              type="tel"
              placeholder="+234..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="pCountry">Country</label>
            <CountrySelect
              id="pCountry"
              value={country}
              onChange={setCountry}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pPassword">Create a Password</label>
          <div className="password-wrap">
            <input
              id="pPassword"
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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {password && (
            <div className="pwd-strength-bar">
              <div
                className="pwd-strength-fill"
                style={{
                  width: `${(strength.score / 4) * 100}%`,
                  backgroundColor: strength.color,
                }}
              />
              <span className="pwd-strength-label" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div className="field field-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span className="checkbox-custom" />
            <span className="checkbox-text">
              I am the parent or legal guardian, and I consent to my child's participation in Seed AI Academy courses. I agree to the{' '}
              <button
                type="button"
                className="inline-link"
                onClick={() => openModal('terms')}
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                className="inline-link"
                onClick={() => openModal('privacy')}
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>
        </div>

        <button type="submit" className="btn btn-lime btn-lg reg-submit-btn" disabled={loading}>
          {loading ? 'Setting up account...' : 'Continue to Hero Creator →'}
        </button>
      </form>
    </div>
  );
}
