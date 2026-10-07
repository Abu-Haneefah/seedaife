'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import ForgotPasswordModal from './ForgotPasswordModal';
import { MascotReaction } from './LoginSeedbot';

interface AdultLoginFormProps {
  onReactionChange: (reaction: MascotReaction) => void;
  onSuccess: (role: string) => void;
}

export default function AdultLoginForm({ onReactionChange, onSuccess }: AdultLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnconfirmed(false);
    setResendSent(false);

    const client = getSupabase();
    if (!client) {
      // Offline / demo fallback
      setTimeout(() => {
        setLoading(false);
        onReactionChange('success');
        try {
          localStorage.setItem(
            'seedai_demo_user',
            JSON.stringify({
              id: 'demo-parent-id',
              email,
              role: 'parent',
              full_name: 'Parent User',
              is_active: true,
            })
          );
        } catch {}
        setTimeout(() => onSuccess('parent'), 600);
      }, 700);
      return;
    }

    const { data, error: signInErr } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInErr) {
      setLoading(false);
      onReactionChange('error');

      if (signInErr.message.toLowerCase().includes('email not confirmed')) {
        setUnconfirmed(true);
        setError('Your email has not been confirmed yet. Please check your inbox or resend the link below.');
      } else if (signInErr.message.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password. Please verify and try again.');
      } else {
        setError(signInErr.message);
      }
      return;
    }

    if (!data.user) {
      setLoading(false);
      onReactionChange('error');
      setError('Unable to load user details. Please try again.');
      return;
    }

    // Fetch user profile from database to determine role and active status
    const { data: profile, error: profileErr } = await client
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profileErr || !profile) {
      // Default to user_metadata role or learner if missing
      const metaRole = data.user.user_metadata?.role || 'learner';
      onReactionChange('success');
      setTimeout(() => onSuccess(metaRole), 500);
      return;
    }

    // Check deactivated status
    if (profile.is_active === false) {
      await client.auth.signOut();
      onReactionChange('error');
      setError('Your account has been deactivated. Please contact support at support@seedaiacademy.com for assistance.');
      return;
    }

    // Remember email for Kid Mode / convenience if enabled
    try {
      if (rememberMe) {
        localStorage.setItem('seedai_last_parent_email', email.trim());
      }
    } catch {}

    onReactionChange('success');
    setTimeout(() => onSuccess(profile.role), 600);
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    const client = getSupabase();
    if (!client) {
      setResending(false);
      setResendSent(true);
      return;
    }

    const { error: resendErr } = await client.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    setResending(false);
    if (resendErr) {
      setError(resendErr.message);
    } else {
      setResendSent(true);
    }
  };

  return (
    <div className="login-form-inner">
      <div className="login-form-header">
        <h2>Sign in to your account</h2>
        <p className="login-form-sub">
          Access your courses, live classes, assignments, and AI projects.
        </p>
      </div>

      {error && (
        <div className="field-err reg-err-banner">
          <p>{error}</p>
          {unconfirmed && (
            <div className="unconfirmed-action">
              {resendSent ? (
                <span className="unconfirmed-sent">✓ Resent confirmation email!</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="reg-form">
        <div className="field">
          <label htmlFor="loginEmail">Email Address</label>
          <input
            id="loginEmail"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => onReactionChange('focus-email')}
            onBlur={() => onReactionChange('idle')}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <div className="field-label-row">
            <label htmlFor="loginPassword">Password</label>
            <button
              type="button"
              className="inline-link forgot-pwd-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot password?
            </button>
          </div>
          <div className="password-wrap">
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => onReactionChange('focus-password')}
              onBlur={() => onReactionChange('idle')}
              autoComplete="current-password"
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
        </div>

        <div className="field field-checkbox login-remember-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkbox-custom" />
            <span className="checkbox-text">Remember me on this device</span>
          </label>
        </div>

        <button type="submit" className="btn btn-lime btn-lg btn-full login-submit-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <div className="login-footer-switch">
          <span>New to Seed AI Academy?</span>{' '}
          <Link href="/register" className="inline-link">
            Create an account
          </Link>
        </div>
      </form>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
}
