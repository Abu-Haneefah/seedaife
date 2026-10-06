'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { getAllCountries, CountryItem } from '@/lib/countries';

interface CountrySelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (countryName: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function CountrySelect({
  id,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Select your country',
  className = '',
}: CountrySelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const countries = getAllCountries();

  // Find currently selected country
  const selectedCountry = countries.find(
    (c) => c.name.toLowerCase() === value.toLowerCase() || c.code.toLowerCase() === value.toLowerCase()
  );

  // Filter countries by search query
  const filteredCountries = search.trim()
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (country: CountryItem) => {
    onChange(country.name);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-wrap ${isOpen ? 'is-open' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for form data */}
      <input
        type="hidden"
        id={selectId}
        name={name}
        value={value}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        className="custom-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="cst-content">
          {selectedCountry ? (
            <>
              <span className="cst-flag" role="img" aria-label={selectedCountry.name}>
                {selectedCountry.flag}
              </span>
              <span className="cst-label">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="cst-placeholder">{placeholder}</span>
          )}
        </span>
        <svg
          className="cst-arrow"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="custom-select-menu" role="listbox" tabIndex={-1}>
          {/* Search Bar */}
          <div className="cst-search-box">
            <svg
              className="cst-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="cst-search-input"
              placeholder="Search 240+ countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                className="cst-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="cst-options-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected =
                  selectedCountry &&
                  selectedCountry.code.toLowerCase() === country.code.toLowerCase();
                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`cst-option ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(country)}
                  >
                    <span className="cst-option-flag">{country.flag}</span>
                    <span className="cst-option-name">{country.name}</span>
                    {isSelected && (
                      <span className="cst-check-icon" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="cst-empty">No country matches &ldquo;{search}&rdquo;</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
