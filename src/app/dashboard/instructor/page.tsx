'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function InstructorDashboardPage() {
  return (
    <div className="view is-active dashboard-view" data-view="dashboard-instructor">
      <DashboardHeader roleTitle="Instructor Portal" roleBadgeColor="var(--lime)" />
      <main className="db-main-content">
        <div className="db-welcome-card">
          <div className="db-welcome-text">
            <h2>Instructor Studio 🎓</h2>
            <p>
              Manage assigned cohorts, schedule and launch Google Meet live classes, review homework submissions, and grade assignments.
            </p>
          </div>
          <div className="db-welcome-actions">
            <button type="button" className="btn btn-lime">
              + Schedule Class Session
            </button>
          </div>
        </div>

        <div className="db-grid-cards">
          <div className="db-card">
            <h3>🔴 Live Class Control</h3>
            <p className="db-card-meta">Cohort A: Generative AI 101</p>
            <p>Set class status to &apos;Live&apos; to enable the Meet URL for enrolled learners.</p>
            <button type="button" className="btn btn-ghost btn-sm">
              Start Class
            </button>
          </div>
          <div className="db-card">
            <h3>📑 Pending Submissions</h3>
            <p className="db-card-meta">3 submissions awaiting review</p>
            <span className="badge-tag">Needs Grading</span>
          </div>
        </div>
      </main>
    </div>
  );
}
