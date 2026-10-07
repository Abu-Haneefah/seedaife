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
  // Always cache PIN in localStorage so Kid Mode PIN works reliably on this device
  try {
    localStorage.setItem(`seedai_pin_${learnerId}`, pin);
  } catch {}

  const client = getSupabase();
  if (!client) {
    return { success: true };
  }

  // Only call RPC if learnerId is a valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(learnerId);
  if (!isUuid) {
    return { success: true };
  }

  const { data, error } = await client.rpc('set_child_pin', {
    target_learner_id: learnerId,
    pin,
  });

  if (error) {
    console.warn('set_child_pin RPC notice:', error.message);
    return { success: false, error: error.message };
  }
  return { success: Boolean(data) };
}

// RPC Helper: Verify child PIN
export async function verifyChildPin(learnerId: string, pin: string): Promise<boolean> {
  // Check local cache first for instant match (handles demo and locally created heroes)
  try {
    const localPin = localStorage.getItem(`seedai_pin_${learnerId}`);
    if (localPin && localPin === pin) {
      return true;
    }
  } catch {}

  // For default demo heroes in case of demo mode
  if (learnerId.startsWith('hero-demo-')) {
    // Default demo PINs or any entered 4-digit code in demo mode if unset
    try {
      const stored = localStorage.getItem(`seedai_pin_${learnerId}`);
      if (!stored) {
        // If no PIN was explicitly set on the demo hero, allow 1234, 0000, or first entered pin
        if (pin === '1234' || pin === '0000') return true;
        localStorage.setItem(`seedai_pin_${learnerId}`, pin);
        return true;
      }
      return stored === pin;
    } catch {
      return true;
    }
  }

  const client = getSupabase();
  if (!client) {
    return false;
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(learnerId);
  if (!isUuid) {
    return false;
  }

  try {
    const { data, error } = await client.rpc('verify_child_pin', {
      target_learner_id: learnerId,
      pin,
    });

    if (error) {
      console.warn('verify_child_pin RPC warning:', error.message);
      // Fallback check against stored local pin if RPC had permissions issue
      try {
        const stored = localStorage.getItem(`seedai_pin_${learnerId}`);
        if (stored === pin) return true;
      } catch {}
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
}

// Fetch current user profile
export async function getCurrentProfile(): Promise<Profile | null> {
  const client = getSupabase();
  if (!client) {
    try {
      const demo = localStorage.getItem('seedai_demo_user');
      if (demo) return JSON.parse(demo);
    } catch {}
    return null;
  }

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

// Fetch learners linked to a parent
export async function fetchParentLearners(parentId: string): Promise<Learner[]> {
  const client = getSupabase();
  if (!client) {
    try {
      const stored = localStorage.getItem(`seedai_demo_learners_${parentId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  const { data, error } = await client
    .from('learners')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Learner[];
}

// Password reset request
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: true };
  }

  const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login?view=reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Complete Sign Out
export async function signOutUser(): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client.auth.signOut();
    } catch {}
  }
  try {
    localStorage.removeItem('seedai_demo_user');
    localStorage.removeItem('seedai_active_kid_hero');
    localStorage.removeItem('seedai_last_parent_email');
    localStorage.removeItem('seedai_guest_user');
  } catch {}
}
