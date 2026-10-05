'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type TimeMode = 'morning' | 'afternoon' | 'night';
export type TimeSetting = 'auto' | TimeMode;

interface TimeModeContextValue {
  activeMode: TimeMode;
  setting: TimeSetting;
  setSetting: (setting: TimeSetting) => void;
  cycleNext: () => void;
  systemMode: TimeMode;
}

const TimeModeContext = createContext<TimeModeContextValue | null>(null);

const STORAGE_KEY = 'seedai_time_mode_setting';

export function getSystemTimeMode(): TimeMode {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning'; // 5:00 AM - 11:59 AM
  if (hour >= 12 && hour < 18) return 'afternoon'; // 12:00 PM - 5:59 PM
  return 'night'; // 6:00 PM - 4:59 AM
}

export function TimeModeProvider({ children }: { children: React.ReactNode }) {
  const [setting, setSettingState] = useState<TimeSetting>('auto');
  const [systemMode, setSystemMode] = useState<TimeMode>('morning');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and system clock on mount
  useEffect(() => {
    const currentSys = getSystemTimeMode();
    setSystemMode(currentSys);

    const saved = localStorage.getItem(STORAGE_KEY) as TimeSetting | null;
    if (saved && (saved === 'auto' || saved === 'morning' || saved === 'afternoon' || saved === 'night')) {
      setSettingState(saved);
    }
    setMounted(true);
  }, []);

  // Periodic check of system time (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSys = getSystemTimeMode();
      setSystemMode((prev) => (prev !== currentSys ? currentSys : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute activeMode: if setting is 'auto', use systemMode; otherwise use explicit setting
  const activeMode: TimeMode = setting === 'auto' ? systemMode : setting;

  // Apply to documentElement data attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-time-mode', activeMode);
    }
  }, [activeMode]);

  const setSetting = (newSetting: TimeSetting) => {
    setSettingState(newSetting);
    try {
      localStorage.setItem(STORAGE_KEY, newSetting);
    } catch {
      // storage unavailable
    }
  };

  const cycleNext = () => {
    const order: TimeSetting[] = ['auto', 'morning', 'afternoon', 'night'];
    const nextIdx = (order.indexOf(setting) + 1) % order.length;
    setSetting(order[nextIdx]);
  };

  const value = useMemo(
    () => ({
      activeMode,
      setting,
      setSetting,
      cycleNext,
      systemMode,
    }),
    [activeMode, setting, systemMode]
  );

  return <TimeModeContext.Provider value={value}>{children}</TimeModeContext.Provider>;
}

export function useTimeMode() {
  const ctx = useContext(TimeModeContext);
  if (!ctx) {
    return {
      activeMode: 'morning' as TimeMode,
      setting: 'auto' as TimeSetting,
      setSetting: () => {},
      cycleNext: () => {},
      systemMode: 'morning' as TimeMode,
    };
  }
  return ctx;
}
