'use client';

import React from 'react';
import { waLink } from '@/lib/config';
import { useModal } from '@/components/Modals';

export default function WhatsAppFab() {
  const { openModal } = useModal();
  const link = waLink('Hi Seed AI Academy, I would like to know more about your courses.');

  const handleClick = (e: React.MouseEvent) => {
    if (!link) {
      e.preventDefault();
      openModal('whatsapp');
    }
  };

  return (
    <a
      className="wa-fab"
      id="waFab"
      href={link || '#'}
      target={link ? '_blank' : undefined}
      rel={link ? 'noopener noreferrer' : undefined}
      aria-label="Chat with Seed AI Academy on WhatsApp"
      onClick={handleClick}
    >
      <svg className="wa-ico" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.6 6.1 1.6C24.6 28.7 30 23.3 30 15.7 30 9.1 24.6 3 16 3Z"
          fill="#B8F23C"
        />
        <path
          d="M12.4 10.9c.2-.5.5-.6.8-.6h.6c.2 0 .5 0 .7.6l.8 1.9c.1.2.1.5-.1.7l-.6.7c-.2.2-.3.4-.1.7.4.7 1.3 1.9 2.4 2.8.9.7 1.6 1 1.9 1.1.3.1.5 0 .7-.1l.8-1c.2-.2.4-.2.7-.1l1.9.9c.3.1.5.2.5.4 0 .2-.1.9-.4 1.5-.3.5-1.2 1-1.7 1.1-.4.1-1 .1-1.6-.1-.4-.1-1-.3-1.7-.6-2.6-1.2-4.3-3.9-4.5-4.1-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.8-2l.1-.2Z"
          fill="#2A1450"
        />
      </svg>
      <span className="wa-text">WhatsApp</span>
    </a>
  );
}
