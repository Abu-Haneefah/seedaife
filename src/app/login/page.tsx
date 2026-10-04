'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="view is-active" data-view="login">
      <section className="placeholder-view">
        <div className="placeholder-card">
          <svg className="placeholder-mark" viewBox="0 0 200 200" aria-hidden="true">
            <use href="#seedai-mark" />
          </svg>
          <p className="eyebrow">Login</p>
          <h1>Logins arrive with the dashboards.</h1>
          <p>Stage 4 adds secure login, logout and role routing for learners, parents, instructors and the super admin.</p>
          <p className="placeholder-note">
            The landing page works without any account or Supabase keys, exactly as this stage requires.
          </p>
          <div className="placeholder-actions">
            <Link className="btn btn-lime btn-lg" href="/#workshop">
              Join the free workshop
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/">
              Back to the landing page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
