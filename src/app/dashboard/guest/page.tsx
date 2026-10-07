'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

export default function GuestDashboardPage() {
  return (
    <div className="view is-active dashboard-view" data-view="dashboard-guest">
      <DashboardHeader roleTitle="Guest Explorer" roleBadgeColor="var(--lilac)" />
      <main className="db-main-content">
        <div className="db-welcome-card">
          <div className="db-welcome-text">
            <h2>Welcome to Seed AI Academy! 🚀</h2>
            <p>
              You&apos;re exploring in guest preview mode. Check out course previews, join the free intro workshop, or upgrade to a full learner account.
            </p>
          </div>
          <div className="db-welcome-actions">
            <Link href="/register" className="btn btn-lime">
              Create Full Account →
            </Link>
            <Link href="/#courses" className="btn btn-ghost">
              Browse All Courses
            </Link>
          </div>
        </div>

        <div className="db-grid-cards">
          <div className="db-card">
            <h3>🌱 Generative AI 101 Preview</h3>
            <p>Intro to AI, prompting, generative audio & video. 6-week foundational journey.</p>
            <span className="badge-tag">Open for preview</span>
          </div>
          <div className="db-card">
            <h3>🎨 Free Intro Workshop</h3>
            <p>Experience a live interactive AI build session with our certified instructors.</p>
            <Link href="/#workshop" className="inline-link">
              Reserve your seat →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
