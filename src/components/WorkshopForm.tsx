'use client';

import React, { useState } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function WorkshopForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Please tell us your name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!role) {
      errs.role = 'Please choose one option.';
    }
    if (role === 'parent' && !age) {
      errs.age = "Please choose your child's age band.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: name.trim(),
      email: email.trim(),
      audience: role,
      child_age_band: role === 'parent' ? age : '',
      created_at: new Date().toISOString(),
    };

    try {
      const key = 'seedai_leads';
      const list = JSON.parse(window.localStorage.getItem(key) || '[]');
      list.push(data);
      window.localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    setSuccessMsg(`Thanks ${data.name}, we will send the free workshop details to ${data.email}.`);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setRole('');
    setAge('');
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section className="section section-dark" id="workshop">
      <div className="section-inner">
        <div className="workshop">
          <div className="workshop-copy reveal">
            <p className="eyebrow">Free intro workshop</p>
            <h2>Try a Seed AI workshop free.</h2>
            <p className="sec-lead">
              One live session, no experience needed, nothing to install. Leave your details and we will send the
              workshop information.
            </p>
            <ul className="workshop-list">
              <li>Live, with a real instructor</li>
              <li>Open to parents, teens, adults, teachers and schools</li>
              <li>Pricing is announced at launch</li>
            </ul>
          </div>

          {!submitted ? (
            <form className="workshop-form reveal" id="workshopForm" onSubmit={handleSubmit} noValidate>
              <div className={`field${errors.name ? ' has-error' : ''}`}>
                <label htmlFor="wsName">Your name</label>
                <input
                  id="wsName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-describedby="wsNameErr"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                />
                {errors.name && (
                  <p className="field-err" id="wsNameErr">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={`field${errors.email ? ' has-error' : ''}`}>
                <label htmlFor="wsEmail">Email</label>
                <input
                  id="wsEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-describedby="wsEmailErr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                />
                {errors.email && (
                  <p className="field-err" id="wsEmailErr">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={`field${errors.role ? ' has-error' : ''}`}>
                <label htmlFor="wsRole">I am a</label>
                <CustomSelect
                  id="wsRole"
                  name="audience"
                  value={role}
                  placeholder="Choose one"
                  onChange={(val) => {
                    setRole(val);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
                  }}
                  options={[
                    { value: 'parent', label: 'Parent (for my child)', hint: 'Ages 6 to 12' },
                    { value: 'teen', label: 'Teen (13 to 17)', hint: 'High school & builders' },
                    { value: 'adult', label: 'Adult / Professional', hint: 'Career & vibe coding' },
                    { value: 'teacher', label: 'Teacher or School', hint: 'Classrooms & groups' },
                  ]}
                />
                {errors.role && (
                  <p className="field-err" id="wsRoleErr">
                    {errors.role}
                  </p>
                )}
              </div>

              {role === 'parent' && (
                <div className={`field${errors.age ? ' has-error' : ''}`} id="wsAgeField">
                  <label htmlFor="wsAge">Child age band</label>
                  <CustomSelect
                    id="wsAge"
                    name="child_age_band"
                    value={age}
                    placeholder="Choose one"
                    onChange={(val) => {
                      setAge(val);
                      if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                    }}
                    options={[
                      { value: '6-9', label: '6 to 9 years old', hint: 'Visual & playful' },
                      { value: '10-13', label: '10 to 13 years old', hint: 'Creators & coders' },
                      { value: '14-18', label: '14 to 18 years old', hint: 'Real portfolio skills' },
                    ]}
                  />
                  {errors.age && (
                    <p className="field-err" id="wsAgeErr">
                      {errors.age}
                    </p>
                  )}
                </div>
              )}

              <button className="btn btn-lime btn-lg" type="submit">
                Save my free place
              </button>
              <p className="form-note">We only use these details to send workshop information.</p>
            </form>
          ) : (
            <div className="workshop-success" id="workshopSuccess">
              <p className="success-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" fill="#B8F23C" />
                  <path
                    d="M14 25l7 7 14-15"
                    fill="none"
                    stroke="#2A1450"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
              <h3 className="success-title">You are on the list.</h3>
              <p className="success-body" id="workshopSuccessBody" role="status">
                {successMsg}
              </p>
              <button className="btn btn-ghost" id="workshopAgain" type="button" onClick={handleReset}>
                Add another person
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
