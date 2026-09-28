// Client & Server shared User Types and Constants for TTS bY Waqas Gill (EmpireNexs)

export type UserPlanType = 'free' | '1m' | '3m' | '10m' | 'unlimited';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  lastActive: string;
  voicesGenerated: number;
  creditsUsed: number;
  creditLimit: number; // 30,000 for free, 1,000,000 for 1M, etc., or -1 for Unlimited
  plan: UserPlanType;
  planName: string;
  isPaid: boolean;
  role: 'owner' | 'user';
  isBlocked: boolean;
  // Monthly billing & expiration fields
  planActivatedAt?: string;
  planExpiresAt?: string | null; // null for permanent owner account
  planStatus?: 'active' | 'expiring_soon' | 'expired';
  daysRemaining?: number | null;
}

export const OWNER_EMAIL = 'muhammadwaqasmwg@gmail.com';
export const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECRET_PIN || '7860';

export const FREE_INITIAL_CREDITS = 30000;
export const MAX_PER_VOICE_CHARACTERS = 50000;
export const STANDARD_PLAN_DAYS = 30;

export const PLANS_CONFIG = {
  free: {
    name: 'Free Starter (Monthly)',
    credits: 30000,
    pricePKR: 0,
    period: 'monthly',
    validityDays: 30,
    description: '30,000 Credits / Month (Renews every 30 days)',
  },
  '1m': {
    name: 'Starter Pack (1M / Month)',
    credits: 1000000,
    pricePKR: 300,
    period: 'monthly',
    validityDays: 30,
    description: '1,000,000 Credits for Rs. 300 PKR / Month',
  },
  '3m': {
    name: 'Creator Pack (3M / Month)',
    credits: 3000000,
    pricePKR: 900,
    period: 'monthly',
    validityDays: 30,
    description: '3,000,000 Credits for Rs. 900 PKR / Month',
  },
  '10m': {
    name: 'Pro Studio (10M / Month)',
    credits: 10000000,
    pricePKR: 2500,
    period: 'monthly',
    validityDays: 30,
    description: '10,000,000 Credits for Rs. 2,500 PKR / Month',
  },
  unlimited: {
    name: 'Unlimited VIP (1 Month)',
    credits: -1, // -1 denotes unlimited
    pricePKR: 4000,
    period: 'monthly',
    validityDays: 30,
    description: 'Unlimited Voice Generations for Rs. 4,000 PKR / Month',
  },
};

export function isStrictGmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}
