'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RegisterEntry, { RegistrationFlow } from '@/components/register/RegisterEntry';
import ParentStepOne from '@/components/register/ParentStepOne';
import KidHeroBuilder from '@/components/register/KidHeroBuilder';
import TeenRegister from '@/components/register/TeenRegister';
import AdultRegister from '@/components/register/AdultRegister';
import GuestRegister from '@/components/register/GuestRegister';
import { getSupabase } from '@/lib/supabase';

function RegisterContent() {
  const searchParams = useSearchParams();
  const [flow, setFlow] = useState<RegistrationFlow | null>(null);
  const [parentStep, setParentStep] = useState<'auth' | 'hero'>('auth');
  const [parentId, setParentId] = useState<string | null>(null);
  const [parentEmail, setParentEmail] = useState<string | null>(null);

  // Handle OAuth redirects (e.g. ?flow=parent&step=hero)
  useEffect(() => {
    const qFlow = searchParams.get('flow') as RegistrationFlow | null;
    const qStep = searchParams.get('step');

    if (qFlow) {
      setFlow(qFlow);
      if (qFlow === 'parent' && qStep === 'hero') {
        const client = getSupabase();
        if (client) {
          client.auth.getUser().then(({ data }) => {
            if (data?.user) {
              setParentId(data.user.id);
              setParentEmail(data.user.email || '');
              setParentStep('hero');
            }
          });
        } else {
          setParentStep('hero');
        }
      }
    }
  }, [searchParams]);

  // When Parent finishes auth and moves to Hero Creator
  const handleParentAuthSuccess = (id: string, email: string) => {
    setParentId(id);
    setParentEmail(email);
    setParentStep('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="view is-active" data-view="register">
      <main className="register-main">
        {/* Step 0: Choose role */}
        {!flow && (
          <RegisterEntry
            onSelectFlow={(selected) => {
              setFlow(selected);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Flow 1: Parent & Kid */}
        {flow === 'parent' && parentStep === 'auth' && (
          <ParentStepOne
            onSuccess={handleParentAuthSuccess}
            onBack={() => setFlow(null)}
          />
        )}

        {flow === 'parent' && parentStep === 'hero' && (
          <KidHeroBuilder
            parentId={parentId || undefined}
            parentEmail={parentEmail || undefined}
            onFinishAll={() => {
              window.location.href = '/dashboard/parent';
            }}
          />
        )}

        {/* Flow 2: Teen */}
        {flow === 'teen' && <TeenRegister onBack={() => setFlow(null)} />}

        {/* Flow 3: Adult & Professional */}
        {flow === 'adult' && <AdultRegister onBack={() => setFlow(null)} />}

        {/* Flow 4: Guest */}
        {flow === 'guest' && <GuestRegister onBack={() => setFlow(null)} />}
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="loading-stage">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
