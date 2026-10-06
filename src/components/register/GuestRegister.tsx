'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

interface GuestRegisterProps {
  onBack: () => void;
}

export default function GuestRegister({ onBack }: GuestRegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const client = getSupabase();
    if (client) {
      // Record lead in database
      await client.from('leads').insert({
        name: name.trim(),
        email: email.trim(),
        audience: 'guest',
      });
    }

    try {
      localStorage.setItem('seedai_guest_user', JSON.stringify({ name, email }));
    } catch {}

    setLoading(false);
    window.location.href = '/dashboard/guest';
  };

  return (
    <div className="reg-flow-card reg-guest-card reveal is-in">
      <div className="reg-header">
        <button type="button" className="reg-back-btn" onClick={onBack}>
          ← Back to roles
        </button>
        <span className="reg-badge">Guest Explorer</span>
      </div>

      <h2>Explore Seed AI Academy</h2>
      <p className="reg-lead">
        Browse free previews, watch class recordings, explore the course ladder, and try interactive AI tools.
      </p>

      <form onSubmit={handleGuestSubmit} className="reg-form">
        <div className="field">
          <label htmlFor="gName">Your Name</label>
          <input
            id="gName"
            type="text"
            required
            placeholder="e.g. Maya"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="gEmail">Email Address</label>
          <input
            id="gEmail"
            type="email"
            required
            placeholder="maya@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-lime btn-lg reg-submit-btn" disabled={loading}>
          {loading ? 'Entering...' : 'Enter as Guest →'}
        </button>
      </form>
    </div>
  );
}
