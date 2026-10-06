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
        Set up your secure parent dashboard. On the next screen, you&apos;ll hand the device to your child to create their custom Hero Card!
      </p>

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
              I am the parent or legal guardian, and I consent to my child&apos;s participation in Seed AI Academy courses. I agree to the{' '}
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
