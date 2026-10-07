'use client';

import React, { useState } from 'react';
import { resetPasswordForEmail } from '@/lib/supabase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export default function ForgotPasswordModal({ isOpen, onClose, defaultEmail = '' }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { success, error: resetErr } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetErr) {
      setError(resetErr);
      return;
    }

    setSent(true);
  };

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="modal-card forgot-pwd-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="forgot-header">
          <div className="forgot-icon">🔑</div>
          <h3>Reset Your Password</h3>
          <p className="forgot-sub">
            Enter the email address tied to your Seed AI account and we&apos;ll send you a password recovery link.
          </p>
        </div>

        {sent ? (
          <div className="forgot-success-box">
            <div className="f-check">✓</div>
            <h4>Check your inbox!</h4>
            <p>
              We sent a secure recovery link to <strong>{email}</strong>. Open the link to set your new password.
            </p>
            <button type="button" className="btn btn-lime btn-full" onClick={onClose}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-form">
            {error && <div className="field-err reg-err-banner">{error}</div>}

            <div className="field">
              <label htmlFor="forgotEmail">Your Account Email</label>
              <input
                id="forgotEmail"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-lime" disabled={loading}>
                {loading ? 'Sending...' : 'Send Recovery Link →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
