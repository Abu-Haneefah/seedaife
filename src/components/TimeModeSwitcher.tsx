'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTimeMode, TimeSetting, TimeMode } from '@/lib/time-mode';

const MODES: Array<{ id: TimeSetting; label: string; icon: string; desc: string }> = [
  { id: 'auto', label: 'Auto (Clock)', icon: '⏱️', desc: 'Syncs with your local time' },
  { id: 'morning', label: 'Morning', icon: '🌅', desc: 'Dawn golden light (5am–12pm)' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', desc: 'Solar bright energy (12pm–6pm)' },
  { id: 'night', label: 'Night', icon: '🌙', desc: 'Cosmic space nebula (6pm–5am)' },
];

export default function TimeModeSwitcher({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { activeMode, setting, setSetting } = useTimeMode();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [open]);

  // Icons for active mode
  const getModeIcon = (mode: TimeMode) => {
    switch (mode) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'night':
        return '🌙';
    }
  };

  return (
    <div className={`time-switcher-wrap ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`time-switcher-btn ${open ? 'is-active' : ''}`}
        aria-label={`Time Mode: ${activeMode}. Setting: ${setting}. Click to change.`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        title={`Current mode: ${activeMode.toUpperCase()} (${setting === 'auto' ? 'Auto synced to clock' : 'Manual lock'})`}
      >
        <span className="ts-icon" aria-hidden="true">
          {getModeIcon(activeMode)}
        </span>
        {!compact && (
          <span className="ts-label">
            <span className="ts-name">
              {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}
            </span>
            {setting === 'auto' && <span className="ts-auto-pill">Auto</span>}
          </span>
        )}
        <svg className="ts-arrow" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path fill="currentColor" d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="time-switcher-menu" role="menu">
          <div className="ts-menu-header">
            <span>Atmosphere & Time</span>
          </div>
          {MODES.map((item) => {
            const isSelected = setting === item.id;
            const isCurrentlyActive = item.id === 'auto' ? false : activeMode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`ts-option ${isSelected ? 'is-selected' : ''}`}
                role="menuitem"
                onClick={() => {
                  setSetting(item.id);
                  setOpen(false);
                }}
              >
                <span className="ts-opt-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="ts-opt-info">
                  <span className="ts-opt-title">
                    {item.label}
                    {item.id !== 'auto' && isCurrentlyActive && setting === 'auto' && (
                      <span className="ts-badge-live">Live</span>
                    )}
                  </span>
                  <span className="ts-opt-desc">{item.desc}</span>
                </span>
                {isSelected && (
                  <svg className="ts-opt-check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M3 8.5l3.5 3.5 7-7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
