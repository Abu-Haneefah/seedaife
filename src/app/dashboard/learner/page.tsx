'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import HeroSvg from '@/components/common/HeroSvg';

function LearnerDashboardContent() {
  const searchParams = useSearchParams();
  const [isKidMode, setIsKidMode] = useState(false);
  const [heroName, setHeroName] = useState('Hero Learner');
  const [heroAvatar, setHeroAvatar] = useState('captain-bolt');

  useEffect(() => {
    const kidParam = searchParams.get('mode') === 'kid';
    setIsKidMode(kidParam);

    try {
      const activeKid = localStorage.getItem('seedai_active_kid_hero');
      if (activeKid) {
        const parsed = JSON.parse(activeKid);
        if (parsed.display_name) setHeroName(parsed.display_name);
        if (parsed.avatar_key) setHeroAvatar(parsed.avatar_key);
      }
    } catch {}
  }, [searchParams]);

  return (
    <div className={`view is-active dashboard-view ${isKidMode ? 'kid-theme-view' : ''}`} data-view="dashboard-learner">
      <DashboardHeader
        roleTitle={isKidMode ? '🦸 Kid Hero Studio' : 'Learner Dashboard'}
        userName={heroName}
        roleBadgeColor="var(--lime)"
      />
      <main className="db-main-content">
        <div className={`db-welcome-card ${isKidMode ? 'kid-welcome-card' : ''}`}>
          {isKidMode && (
            <div className="kid-welcome-hero-avatar">
              <HeroSvg heroKey={heroAvatar} color="#B8F23C" />
            </div>
          )}
          <div className="db-welcome-text">
            <h2>{isKidMode ? `Welcome back, ${heroName}! ⭐` : 'Welcome back, Learner! 🚀'}</h2>
            <p>
              {isKidMode
                ? 'Your quests, badges, and creative AI challenges are waiting for you.'
                : 'Track your upcoming live classes, assignments, and portfolio projects here.'}
            </p>
          </div>
        </div>

        <div className="db-grid-cards">
          <div className="db-card">
            <h3>📅 Next Live Class</h3>
            <p className="db-card-meta">Generative AI 101 - Saturday 10:00 AM</p>
            <p>Class link will become active 10 minutes prior to session start.</p>
            <button type="button" className="btn btn-ghost btn-sm" disabled>
              Waiting for instructor
            </button>
          </div>
          <div className="db-card">
            <h3>📝 Assignments & Missions</h3>
            <p className="db-card-meta">Mission 1: My Prompt Playbook</p>
            <span className="badge-tag">To Do</span>
          </div>
          <div className="db-card">
            <h3>🏆 XP & Streak</h3>
            <p className="db-card-meta">Level 1 • 250 XP earned</p>
            <div className="db-progress-bar">
              <div className="db-progress-fill" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LearnerDashboardPage() {
  return (
    <Suspense fallback={<div className="loading-stage">Loading learner portal...</div>}>
      <LearnerDashboardContent />
    </Suspense>
  );
}
