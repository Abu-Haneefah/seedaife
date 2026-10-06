// Seed AI Academy Configuration

export interface AppConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SEEDAI_EMAIL: string;
  WHATSAPP_NUMBER: string;
  INSTAGRAM_URL: string;
  YOUTUBE_URL: string;
  LINKEDIN_URL: string;
  SITE_URL: string;
}

function getEnvVal(val: string | undefined, fallback: string): string {
  if (typeof val === 'string' && val.trim() !== '' && !/^\[.*\]$/.test(val.trim())) {
    return val.trim();
  }
  return fallback;
}

export const CONFIG: AppConfig = {
  SUPABASE_URL: getEnvVal(process.env.NEXT_PUBLIC_SUPABASE_URL, '[SUPABASE_URL]'),
  SUPABASE_ANON_KEY: getEnvVal(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, '[SUPABASE_ANON_KEY]'),
  SEEDAI_EMAIL: getEnvVal(process.env.NEXT_PUBLIC_SEEDAI_EMAIL, 'seedaiacademy@gmail.com'),
  WHATSAPP_NUMBER: getEnvVal(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, '+2349069115484'),
  INSTAGRAM_URL: getEnvVal(process.env.NEXT_PUBLIC_INSTAGRAM_URL, 'https://www.instagram.com/seedaiacademy/'),
  YOUTUBE_URL: getEnvVal(process.env.NEXT_PUBLIC_YOUTUBE_URL, 'https://www.youtube.com/channel/UCcVTAm_6sYBWbTMIBRf2akA'),
  LINKEDIN_URL: getEnvVal(process.env.NEXT_PUBLIC_LINKEDIN_URL, 'https://www.linkedin.com/in/fatai-jabar-9309a4279/'),
  SITE_URL: getEnvVal(process.env.NEXT_PUBLIC_SITE_URL, 'https://seedaife.vercel.app'),
};

export const isPlaceholder = (v: string | undefined): boolean => {
  return !v || /^\[.*\]$/.test(String(v).trim());
};

export const digitsOnly = (v: string | undefined): string => {
  return String(v || '').replace(/\D/g, '');
};

export const waLink = (text?: string): string => {
  const n = digitsOnly(CONFIG.WHATSAPP_NUMBER);
  return n ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';
};

export const mailLink = (subject?: string): string => {
  if (isPlaceholder(CONFIG.SEEDAI_EMAIL)) return '';
  return `mailto:${CONFIG.SEEDAI_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
};

export const safeUrl = (v: string | undefined): string => {
  const s = String(v || '').trim();
  if (!s || isPlaceholder(s)) return '';
  return /^https?:\/\/[^\s]+$/i.test(s) ? s : '';
};
