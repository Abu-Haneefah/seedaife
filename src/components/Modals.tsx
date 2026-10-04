'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CONFIG } from '@/lib/config';

interface ModalContent {
  title: string;
  body: string[];
}

const MODAL_DATA: Record<string, ModalContent> = {
  privacy: {
    title: 'Privacy',
    body: [
      'Placeholder text. Replace with a real Privacy Policy and get it legally reviewed before launch, especially for children’s data.',
      'In summary, Seed AI Academy only collects what is needed to run classes and keep parents informed. Children under 13 never get their own login: they learn as a profile under a parent account, protected by a PIN. There is no advertising to children.',
      `For privacy questions, contact ${CONFIG.SEEDAI_EMAIL}.`,
    ],
  },
  terms: {
    title: 'Terms',
    body: [
      'Placeholder text. Replace with real Terms of Service before launch.',
      'Course lengths, prerequisites and project outcomes described on this site follow our current curriculum plan. Delivery format (live, self-paced, in person) is confirmed at registration.',
      'Pricing is announced at launch. Join the free workshop to get early access.',
    ],
  },
  whatsapp: {
    title: 'WhatsApp',
    body: [
      `The WhatsApp button is wired to ${CONFIG.WHATSAPP_NUMBER} in the https://wa.me/ format.`,
      'Add your number in the environment configuration and this button connects directly to your WhatsApp.',
    ],
  },
  email: {
    title: 'Email',
    body: [
      `Every email link on the site reads from ${CONFIG.SEEDAI_EMAIL}.`,
      'Add your address in the environment configuration and this link goes live.',
    ],
  },
};

interface ModalContextType {
  openModal: (key: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (key: string) => {
    setActiveModal(key);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const modal = activeModal ? MODAL_DATA[activeModal] : null;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal && (
        <div className="modal" id="modal">
          <div className="modal-backdrop" onClick={closeModal} />
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
            aria-describedby="modalBody"
          >
            <button
              className="modal-close"
              id="modalClose"
              type="button"
              aria-label="Close dialog"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 id="modalTitle">{modal.title}</h2>
            <div className="modal-body" id="modalBody">
              {modal.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
