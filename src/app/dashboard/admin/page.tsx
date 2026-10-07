'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function AdminDashboardPage() {
  return (
    <div className="view is-active dashboard-view" data-view="dashboard-admin">
      <DashboardHeader roleTitle="Super Admin" roleBadgeColor="var(--coral)" />
      <main className="db-main-content">
        <div className="db-welcome-card">
          <div className="db-welcome-text">
            <h2>Super Admin Command Center ⚡</h2>
            <p>
              Full system control: user management, instructor promotion, class schedules, leads conversion, and platform audit logs.
            </p>
          </div>
          <div className="db-welcome-actions">
            <button type="button" className="btn btn-lime">
              System Settings
            </button>
          </div>
        </div>

        <div className="db-grid-cards">
          <div className="db-card">
            <h3>👥 Total Profiles</h3>
            <p className="db-card-meta">Learners, parents & instructors</p>
            <span className="badge-tag">Database Connected</span>
          </div>
          <div className="db-card">
            <h3>📬 Leads Queue</h3>
            <p className="db-card-meta">Free workshop registrations & guest visitors</p>
          </div>
          <div className="db-card">
            <h3>🔒 Security & Audit Log</h3>
            <p className="db-card-meta">Row Level Security verified active</p>
          </div>
        </div>
      </main>
    </div>
  );
}
