import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG, isPlaceholder } from './config';

export type UserRole = 'guest' | 'learner' | 'parent' | 'instructor' | 'super_admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  avatar_key?: string | null;
  audience_type?: 'parent' | 'teen' | 'adult' | 'professional' | 'other' | null;
  professional_track?: 'accountant' | 'content_creator' | 'educator' | 'other' | null;
  consent_accepted_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Learner {
  id: string;
  user_id?: string | null;
  parent_id?: string | null;
  display_name: string;
  age_band: '6-9' | '10-13' | '14-18' | 'adult';
  avatar_key?: string | null;
  xp: number;
  level: number;
  created_at: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // Server-side or build time
    if (!isPlaceholder(CONFIG.SUPABASE_URL) && !isPlaceholder(CONFIG.SUPABASE_ANON_KEY)) {
      return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return null;
  }

  if (!supabaseInstance) {
    if (!isPlaceholder(CONFIG.SUPABASE_URL) && !isPlaceholder(CONFIG.SUPABASE_ANON_KEY)) {
      supabaseInstance = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
  }
  return supabaseInstance;
}

export const isSupabaseConfigured = (): boolean => {
  return !isPlaceholder(CONFIG.SUPABASE_URL) && !isPlaceholder(CONFIG.SUPABASE_ANON_KEY);
};

// RPC Helper: Set child PIN
export async function setChildPin(learnerId: string, pin: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    // In mock/offline mode, store in localStorage for demo
    try {
      localStorage.setItem(`seedai_pin_${learnerId}`, pin);
      return { success: true };
    } catch {
      return { success: true };
    }
  }

  const { data, error } = await client.rpc('set_child_pin', {
    target_learner_id: learnerId,
    pin,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: Boolean(data) };
}

// RPC Helper: Verify child PIN
export async function verifyChildPin(learnerId: string, pin: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) {
    try {
      const stored = localStorage.getItem(`seedai_pin_${learnerId}`);
      return stored === pin;
    } catch {
      return true;
    }
  }

  const { data, error } = await client.rpc('verify_child_pin', {
    target_learner_id: learnerId,
    pin,
  });

  if (error) return false;
  return Boolean(data);
}
