'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OtpVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean | void>;
  onResend: () => Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function OtpVerification({
  email,
  onVerify,
  onResend,
  onBack,
  loading = false,
  error = null,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Focus first input box on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1); // only take the last character typed
    if (char && !/^\d$/.test(char)) return; // must be digit

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      handleComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const chars = pasteData.split('');
      setDigits(chars);
      inputRefs.current[5]?.focus();
      handleComplete(pasteData);
    }
  };

  const handleComplete = async (code: string) => {
    setSubmitting(true);
    try {
      await onVerify(code);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length === 6) {
      handleComplete(code);
    }
  };

  const handleResendClick = async () => {
    if (resendTimer > 0) return;
    await onResend();
    setResendTimer(60);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="otp-card">
      <div className="otp-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="3" stroke="#B8F23C" />
          <path d="M3 7l9 6 9-6" stroke="#B8F23C" />
        </svg>
      </div>

      <h2>Verify Your Email</h2>
      <p className="otp-sub">
        We sent a 6-digit confirmation code to:
        <br />
        <strong>{email}</strong>
      </p>

      {error && <div className="field-err otp-error">{error}</div>}

      <form onSubmit={handleSubmit} className="otp-form">
        <div className="otp-boxes" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoComplete="one-time-code"
              className={`otp-box ${digit ? 'has-val' : ''}`}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={loading || submitting}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-lime btn-lg otp-submit-btn"
          disabled={!isComplete || loading || submitting}
        >
          {loading || submitting ? 'Verifying code...' : 'Confirm and Continue'}
        </button>
      </form>

      <div className="otp-footer">
        <p className="otp-resend-text">
          Didn&apos;t get the code?{' '}
          {resendTimer > 0 ? (
            <span className="otp-timer">Resend in {resendTimer}s</span>
          ) : (
            <button type="button" onClick={handleResendClick} className="otp-resend-link">
              Resend code
            </button>
          )}
        </p>

        {onBack && (
          <button type="button" onClick={onBack} className="otp-back-link">
            ← Change email address
          </button>
        )}
      </div>
    </div>
  );
}
