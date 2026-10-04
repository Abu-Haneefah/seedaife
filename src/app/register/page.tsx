'use client';

import React from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="view is-active" data-view="register">
      <section className="placeholder-view">
        <div className="placeholder-card">
          <svg className="placeholder-mark" viewBox="0 0 200 200" aria-hidden="true">
            <use href="#seedai-mark" />
          </svg>
          <p className="eyebrow">Registration</p>
          <h1>Registration opens soon.</h1>
          <p>
            Stage 3 replaces this page with four different registration experiences: a parent registering a child, a
            teenager, an adult and a professional.
          </p>
          <p className="placeholder-note">
            Nothing to sign up for just yet. Join the free workshop and we will tell you the moment places open.
          </p>
          <div className="placeholder-actions">
            <Link className="btn btn-lime btn-lg" href="/">
              Back to the landing page
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/#workshop">
              Join the free workshop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
