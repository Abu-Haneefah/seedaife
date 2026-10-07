'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/supabase';

interface DashboardHeaderProps {
  roleTitle: string;
  userName?: string;
  roleBadgeColor?: string;
}

export default function DashboardHeader({
  roleTitle,
  userName = 'Seed AI Member',
  roleBadgeColor = 'var(--lime)',
}: DashboardHeaderProps) {
  const router = useRouter();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOutUser();
    setLoggingOut(false);
    setShowConfirmLogout(false);
    router.push('/login?reason=logged_out');
  };

  return (
    <>
      <header className="db-header">
        <div className="db-header-inner">
          <Link href="/" className="db-brand">
            <svg className="brand-mark" viewBox="0 0 200 200" aria-hidden="true" style={{ width: 36, height: 36 }}>
              <use href="#seedai-mark" />
            </svg>
            <span className="brand-words">
              <span className="brand-name">
                <span className="w-seed">Seed</span>
                <span className="w-ai">AI</span>
              </span>
              <span className="brand-sub">Academy</span>
            </span>
          </Link>

          <div className="db-header-center">
            <span className="db-role-pill" style={{ borderColor: roleBadgeColor, color: roleBadgeColor }}>
              {roleTitle}
            </span>
          </div>

          <div className="db-header-actions">
            <span className="db-user-greet">Hi, {userName}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm db-logout-btn"
              onClick={() => setShowConfirmLogout(true)}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      {showConfirmLogout && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setShowConfirmLogout(false)} />
          <div
            className="modal-card logout-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logoutModalTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-icon">👋</div>
            <h3 id="logoutModalTitle">Ready to sign out?</h3>
            <p>
              Your progress and session data are safely saved. You will return to the home page.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowConfirmLogout(false)}
                disabled={loggingOut}
              >
                Stay Logged In
              </button>
              <button
                type="button"
                className="btn btn-coral"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
