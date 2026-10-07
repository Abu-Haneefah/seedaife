'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginSeedbot, { MascotReaction } from '@/components/login/LoginSeedbot';
import AdultLoginForm from '@/components/login/AdultLoginForm';
import KidHeroLogin from '@/components/login/KidHeroLogin';
import { Learner } from '@/lib/supabase';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'adult' | 'kid'>('adult');
  const [reaction, setReaction] = useState<MascotReaction>('idle');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'kid') {
      setTab('kid');
    }
    const reason = searchParams.get('reason');
    if (reason === 'logged_out') {
      setToastMsg('See you soon! You have been safely logged out.');
      setTimeout(() => setToastMsg(null), 4000);
    }
  }, [searchParams]);

  // Handle successful Adult Login
  const handleAdultSuccess = (role: string) => {
    switch (role) {
      case 'parent':
        router.push('/dashboard/parent');
        break;
      case 'instructor':
        router.push('/dashboard/instructor');
        break;
      case 'super_admin':
        router.push('/dashboard/admin');
        break;
      case 'guest':
        router.push('/dashboard/guest');
        break;
      case 'learner':
      default:
        router.push('/dashboard/learner');
        break;
    }
  };

  // Handle successful Kid Mode PIN Login
  const handleKidSuccess = (learner: Learner) => {
    router.push('/dashboard/learner?mode=kid');
  };

  return (
    <div className="view is-active login-view" data-view="login">
      {toastMsg && <div className="seed-toast reveal is-in">{toastMsg}</div>}

      <div className="login-split-container">
        {/* Left Side: Interactive 3D Seedbot Scene */}
        <aside className="login-mascot-panel" aria-hidden="true">
          <div className="login-mascot-sticky">
            <LoginSeedbot reaction={reaction} />
          </div>
        </aside>

        {/* Right Side: Authentication Forms */}
        <main className="login-form-panel">
          <div className="login-card">
            {/* Mode Tabs */}
            <div className="login-tabs-nav" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'adult'}
                className={`login-tab-btn ${tab === 'adult' ? 'is-active' : ''}`}
                onClick={() => {
                  setTab('adult');
                  setReaction('idle');
                }}
              >
                🔐 Account Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'kid'}
                className={`login-tab-btn ${tab === 'kid' ? 'is-active' : ''}`}
                onClick={() => {
                  setTab('kid');
                  setReaction('idle');
                }}
              >
                🦸 Kid Hero Mode
              </button>
            </div>

            {tab === 'adult' ? (
              <AdultLoginForm
                onReactionChange={setReaction}
                onSuccess={handleAdultSuccess}
              />
            ) : (
              <KidHeroLogin
                onReactionChange={setReaction}
                onSuccess={handleKidSuccess}
                onSwitchToParentLogin={() => setTab('adult')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-stage">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
