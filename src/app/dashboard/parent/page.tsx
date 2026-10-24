'use client';

import React from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function ParentDashboardPage() {
  return (
    <div className="view is-active dashboard-view" data-view="dashboard-parent">
      <DashboardHeader roleTitle="Parent Portal" roleBadgeColor="var(--lilac)" />
      <main className="db-main-content">
        <div className="db-welcome-card">
          <div className="db-welcome-text">
            <h2>Welcome to Your Parent Portal 🛡️</h2>
            <p>
              Supervise your child&apos;s AI learning, view attendance, review assignments, and switch directly into Kid Hero mode.
            </p>
          </div>
          <div className="db-welcome-actions">
            <Link href="/login?mode=kid" className="btn btn-lime">
              Launch Kid Hero Mode 🦸
            </Link>
            <Link href="/register?flow=parent&step=hero" className="btn btn-ghost">
              + Add Another Hero
            </Link>
          </div>
        </div>

        <div className="db-grid-cards">
          <div className="db-card">
            <h3>👥 Enrolled Children</h3>
            <p className="db-card-meta">Learner Hero profiles linked to this account</p>
            <span className="badge-tag">Active • 1 Child</span>
          </div>
          <div className="db-card">
            <h3>📊 Progress & Attendance</h3>
            <p>All classes attended on time. Next report generated after Project 1 review.</p>
          </div>
          <div className="db-card">
            <h3>💬 Instructor Messages</h3>
            <p>No new messages from instructor. Direct communication is open during live terms.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
